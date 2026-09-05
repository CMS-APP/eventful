import requests
from firebase_admin import firestore
from firebase_functions import firestore_fn

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_expo_notifications(
    user_id: str,
    title: str | None = None,
    body: str | None = None,
    badge: int | None = None,
) -> None:
    db = firestore.client()
    user_doc = db.collection("user").document(user_id).get()

    if not user_doc.exists:
        print(f"User not found: {user_id}")
        return

    push_tokens = (user_doc.to_dict() or {}).get("pushTokens", [])
    valid_tokens = [
        token
        for token in push_tokens
        if isinstance(token, str) and token.startswith("ExponentPushToken")
    ]

    if not valid_tokens:
        print(f"No valid Expo push tokens for user: {user_id}")
        return

    messages = []
    for token in valid_tokens:
        message = {"to": token}
        if title is not None:
            message["title"] = title
        if body is not None:
            message["body"] = body
        if title is not None or body is not None:
            message["sound"] = "default"
        if badge is not None:
            message["badge"] = badge
        messages.append(message)

    try:
        response = requests.post(EXPO_PUSH_URL, json=messages, timeout=10)
        print(f"Expo notifications sent: {response.status_code} {response.text}")
    except Exception as exc:
        print(f"Error sending Expo notifications: {exc}")


def _count_unread_notifications(db, user_id: str) -> int:
    docs = db.collection("notifications").where("userId", "==", user_id).stream()
    return sum(1 for doc in docs if doc.to_dict().get("read") is False)


def _count_pending_invites(db, user_id: str) -> int:
    docs = db.collection("invite").where("recipient", "==", user_id).stream()
    return sum(
        1 for doc in docs if doc.to_dict().get("response") in ("pending", "maybe")
    )


def recompute_unread_badge(user_id: str) -> int:
    db = firestore.client()
    badge = _count_unread_notifications(db, user_id) + _count_pending_invites(
        db, user_id
    )
    db.collection("user").document(user_id).set(
        {"unreadNotificationCount": badge}, merge=True
    )
    return badge


def handle_notification_written(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    after = event.data.after.to_dict() if event.data.after else None
    before = event.data.before.to_dict() if event.data.before else None
    user_id = (after or before or {}).get("userId")
    if not user_id:
        return

    try:
        badge = recompute_unread_badge(user_id)
        send_expo_notifications(user_id, badge=badge)
    except Exception as exc:
        print(f"Error updating badge for notification: {exc}")


def handle_invite_written(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    after = event.data.after.to_dict() if event.data.after else None
    before = event.data.before.to_dict() if event.data.before else None
    recipient = (after or before or {}).get("recipient")
    if not recipient:
        return

    try:
        badge = recompute_unread_badge(recipient)
        send_expo_notifications(recipient, badge=badge)
    except Exception as exc:
        print(f"Error updating badge for invite: {exc}")
