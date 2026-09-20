from datetime import datetime, timezone

from firebase_admin import firestore
from firebase_functions import https_fn
from google.cloud.firestore import Query

from sdk.expo_push import send_expo_notifications
from sdk.recaptcha import verify_recaptcha
from utils.https import response

COOLDOWN_SECONDS = 5 * 60


def handle_respond_to_event_request(req: https_fn.Request, recaptcha_secret) -> https_fn.Response:
    if req.method != "POST":
        return response("Method Not Allowed", 405)

    body = req.get_json(silent=True) or {}
    eventId = body.get("eventId")
    eventName = body.get("eventName")
    hostId = body.get("hostId")
    userResponse = body.get("response")
    name = body.get("name")
    email = body.get("email")
    recaptchaToken = body.get("recaptchaToken")
    deviceId = body.get("deviceId")
    ip = req.headers.get("X-Forwarded-For", "unknown-ip")

    if not userResponse or not name or not recaptchaToken or not deviceId:
        return response("Missing required fields", 400)

    responderLabel = f"{name} ({email})" if email else name

    try:
        if not verify_recaptcha(recaptcha_secret, recaptchaToken):
            return response("reCAPTCHA validation failed", 403)

        db = firestore.client()

        emailSnap = None
        if email:
            emailSnap = list(
                db.collection("eventResponses")
                .where("email", "==", email)
                .where("eventId", "==", eventId)
                .order_by("responseTimestamp", direction=Query.DESCENDING)
                .limit(1)
                .stream()
            )

        deviceSnap = list(
            db.collection("eventResponses")
            .where("deviceId", "==", deviceId)
            .where("eventId", "==", eventId)
            .order_by("responseTimestamp", direction=Query.DESCENDING)
            .limit(1)
            .stream()
        )

        eResp = emailSnap[0].to_dict() if emailSnap else None
        dResp = deviceSnap[0].to_dict() if deviceSnap else None

        if eResp or dResp:
            eRespTime = eResp["responseTimestamp"] if eResp else None
            dRespTime = dResp["responseTimestamp"] if dResp else None
            lastResponseTime = max(t for t in (eRespTime, dRespTime) if t is not None)

            now = datetime.now(timezone.utc)
            seconds = (now - lastResponseTime).total_seconds()
            if seconds < COOLDOWN_SECONDS:
                remainingSeconds = int(COOLDOWN_SECONDS - seconds)
                msg = f"Too many responses. Please wait: {remainingSeconds} seconds."
                return response(msg, 429)

            responseRef = emailSnap[0].reference if emailSnap else deviceSnap[0].reference
            responseRef.update(
                {
                    "response": userResponse,
                    "responseIp": ip,
                    "responseTimestamp": now,
                    "name": name,
                    "email": email,
                }
            )

            if hostId:
                send_expo_notifications(
                    hostId,
                    title="New Event Response",
                    body=f"{responderLabel} just responded to your event ({eventName}).",
                )
            return response("Response updated", 200)

        now = datetime.now(timezone.utc)
        dof = db.collection("eventResponses").document()
        dof.set(
            {
                "id": dof.id,
                "eventId": eventId,
                "hostId": hostId,
                "email": email,
                "deviceId": deviceId,
                "response": userResponse,
                "responseIp": ip,
                "responseTimestamp": now,
                "name": name,
            }
        )

        if hostId:
            send_expo_notifications(
                hostId,
                title="New Event Response",
                body=f"{responderLabel} just responded to your event ({eventName}).",
            )

        return response("Response recorded", 200)
    except Exception as exc:
        print(f"Error processing request: {exc}")
        return response("Internal Server Error", 500)
