from datetime import datetime, timezone

from src.sdk.firebase.firestore import get, query

RESPONSE_ORDER = {"accept": 0, "maybe": 1, "decline": 2}


class GuestListError(Exception):
    def __init__(self, message: str, status: int):
        self.message = message
        self.status = status
        super().__init__(message)


def _normalize_response(value: str | None) -> str:
    if value in ("accept", "maybe", "decline"):
        return value
    return "maybe"


def _link_response_guests(event_id: str) -> list[dict]:
    guests: list[dict] = []

    for respDoc in query("eventResponses", eventId=event_id).stream():
        resp = respDoc.to_dict() or {}
        if not (name := resp.get("name")):
            continue
        guests.append({"name": name, "response": _normalize_response(resp.get("response"))})
    return guests


def _build_guest_list(event_id: str, event: dict) -> list[dict]:
    guests: list[dict] = []

    for inviteDoc in query("invite", eventId=event_id).stream():
        invite = inviteDoc.to_dict() or {}
        if not (recipient := invite.get("recipient")):
            continue
        userSnap = get("user", recipient)
        name = (userSnap.to_dict() or {}).get("name") if userSnap.exists else None
        if not name:
            continue
        guests.append({"name": name, "response": _normalize_response(invite.get("response"))})

    for guest in event.get("guestList") or []:
        if not (name := guest.get("name")):
            continue
        guests.append({"name": name, "response": _normalize_response(guest.get("response"))})

    guests.extend(_link_response_guests(event_id))
    guests.sort(key=lambda guest: RESPONSE_ORDER.get(guest["response"], 1))
    return guests


def get_event_guest_list(event_id: str, viewer_uid: str) -> list[dict]:
    eventSnap = get("event", event_id)
    if not eventSnap.exists:
        raise GuestListError("Event not found", 404)

    event = eventSnap.to_dict() or {}
    invited = event.get("invited") or []
    isHost = event.get("userId") == viewer_uid
    if not isHost and viewer_uid not in invited:
        raise GuestListError("Forbidden", 403)

    return _build_guest_list(event_id, event)


def get_public_event_guest_list(event_id: str) -> list[dict]:
    linkSnap = get("eventLinks", event_id)
    if not linkSnap.exists:
        raise GuestListError("Event not found", 404)

    link = linkSnap.to_dict() or {}
    dateTime = link.get("dateTime")
    isExpired = dateTime is not None and dateTime <= datetime.now(timezone.utc)
    if not link.get("enabled") or isExpired:
        raise GuestListError("Event not found", 404)

    guests = _link_response_guests(event_id)
    guests.sort(key=lambda guest: RESPONSE_ORDER.get(guest["response"], 1))
    return guests
