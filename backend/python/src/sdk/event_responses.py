from datetime import datetime, timezone

from firebase_admin import firestore
from google.cloud.firestore import Query

from src.sdk.integrations.expo_push import send_expo_notifications

COOLDOWN_SECONDS = 5 * 60


class CooldownActive(Exception):
    def __init__(self, remaining_seconds: int):
        self.remaining_seconds = remaining_seconds
        super().__init__(f"Cooldown active for {remaining_seconds}s")


def _find_existing_response(db, event_id, email, device_id):
    emailSnap = None
    if email:
        emailSnap = list(
            db.collection("eventResponses")
            .where("email", "==", email)
            .where("eventId", "==", event_id)
            .order_by("responseTimestamp", direction=Query.DESCENDING)
            .limit(1)
            .stream()
        )

    deviceSnap = list(
        db.collection("eventResponses")
        .where("deviceId", "==", device_id)
        .where("eventId", "==", event_id)
        .order_by("responseTimestamp", direction=Query.DESCENDING)
        .limit(1)
        .stream()
    )
    return emailSnap, deviceSnap


def record_event_response(
    *, event_id, event_name, host_id, user_response, name, email, device_id, ip
) -> str:
    responderLabel = f"{name} ({email})" if email else name
    db = firestore.client()

    emailSnap, deviceSnap = _find_existing_response(db, event_id, email, device_id)
    eResp = emailSnap[0].to_dict() if emailSnap else None
    dResp = deviceSnap[0].to_dict() if deviceSnap else None

    if eResp or dResp:
        eRespTime = eResp["responseTimestamp"] if eResp else None
        dRespTime = dResp["responseTimestamp"] if dResp else None
        lastResponseTime = max(t for t in (eRespTime, dRespTime) if t is not None)

        now = datetime.now(timezone.utc)
        seconds = (now - lastResponseTime).total_seconds()
        if seconds < COOLDOWN_SECONDS:
            raise CooldownActive(int(COOLDOWN_SECONDS - seconds))

        responseRef = emailSnap[0].reference if emailSnap else deviceSnap[0].reference
        responseRef.update(
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
                body=f"{responderLabel} just responded to your event ({event_name}).",
            )
        return "updated"

    now = datetime.now(timezone.utc)
    dof = db.collection("eventResponses").document()
    dof.set(
        {
            "id": dof.id,
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
            body=f"{responderLabel} just responded to your event ({event_name}).",
        )

    return "created"
