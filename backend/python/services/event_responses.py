from datetime import datetime, timezone

import requests
from firebase_admin import firestore
from firebase_functions import https_fn

from services.notifications import send_expo_notifications

RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"
COOLDOWN_SECONDS = 5 * 60


def handle_respond_to_event_request(req: https_fn.Request, recaptcha_secret) -> https_fn.Response:
    if req.method != "POST":
        return https_fn.Response("Method Not Allowed", status=405)

    body = req.get_json(silent=True) or {}
    event_id = body.get("eventId")
    event_name = body.get("eventName")
    host_id = body.get("hostId")
    user_response = body.get("response")
    name = body.get("name")
    email = body.get("email")
    recaptcha_token = body.get("recaptchaToken")
    device_id = body.get("deviceId")
    ip = req.headers.get("X-Forwarded-For", "unknown-ip")

    if not user_response or not name or not recaptcha_token or not device_id:
        return https_fn.Response("Missing required fields", status=400)

    responder_label = f"{name} ({email})" if email else name

    try:
        recaptcha_response = requests.post(
            RECAPTCHA_VERIFY_URL,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data=f"secret={recaptcha_secret.value}&response={recaptcha_token}",
            timeout=10,
        ).json()

        if not recaptcha_response.get("success"):
            print(f"reCAPTCHA verification failed: {recaptcha_response}")
            return https_fn.Response("reCAPTCHA validation failed", status=403)

        db = firestore.client()

        email_snapshot = None
        if email:
            email_snapshot = list(
                db.collection("eventResponses")
                .where("email", "==", email)
                .where("eventId", "==", event_id)
                .order_by("responseTimestamp", direction=firestore.Query.DESCENDING)
                .limit(1)
                .stream()
            )

        device_snapshot = list(
            db.collection("eventResponses")
            .where("deviceId", "==", device_id)
            .where("eventId", "==", event_id)
            .order_by("responseTimestamp", direction=firestore.Query.DESCENDING)
            .limit(1)
            .stream()
        )

        last_email_response = email_snapshot[0].to_dict() if email_snapshot else None
        last_device_response = device_snapshot[0].to_dict() if device_snapshot else None

        if last_email_response or last_device_response:
            last_email_response_time = (
                last_email_response["responseTimestamp"] if last_email_response else None
            )
            last_device_response_time = (
                last_device_response["responseTimestamp"] if last_device_response else None
            )
            last_response_time = max(
                t for t in (last_email_response_time, last_device_response_time) if t is not None
            )

            now = datetime.now(timezone.utc)
            elapsed_seconds = (now - last_response_time).total_seconds()
            if elapsed_seconds < COOLDOWN_SECONDS:
                remaining_seconds = int(COOLDOWN_SECONDS - elapsed_seconds)
                remaining_minutes = remaining_seconds // 60
                remaining_seconds = remaining_seconds % 60

                if remaining_minutes > 0:
                    return https_fn.Response(
                        f"Too many responses. Please wait: {remaining_minutes} minutes and "
                        f"{remaining_seconds} seconds.",
                        status=429,
                    )

                return https_fn.Response(
                    f"Too many responses. Please wait: {remaining_seconds} seconds.",
                    status=429,
                )

            existing_response_ref = (
                email_snapshot[0].reference if last_email_response else device_snapshot[0].reference
            )
            existing_response_ref.update(
                {
                    "response": user_response,
                    "responseIp": ip,
                    "responseTimestamp": now,
                    "name": name,
                    "email": email,
                }
            )

            if host_id:
                send_expo_notifications(
                    host_id,
                    title="New Event Response",
                    body=f"{responder_label} just responded to your event ({event_name}).",
                )
            return https_fn.Response("Response updated", status=200)

        now = datetime.now(timezone.utc)
        doc_ref = db.collection("eventResponses").document()
        doc_ref.set(
            {
                "id": doc_ref.id,
                "eventId": event_id,
                "hostId": host_id,
                "email": email,
                "deviceId": device_id,
                "response": user_response,
                "responseIp": ip,
                "responseTimestamp": now,
                "name": name,
            }
        )

        if host_id:
            send_expo_notifications(
                host_id,
                title="New Event Response",
                body=f"{responder_label} just responded to your event ({event_name}).",
            )

        return https_fn.Response("Response recorded", status=200)
    except Exception as exc:
        print(f"Error processing request: {exc}")
        return https_fn.Response("Internal Server Error", status=500)
