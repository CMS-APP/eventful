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


def increment_badge_and_notify(user_id: str) -> None:
    db = firestore.client()
    user_ref = db.collection("user").document(user_id)
    user_ref.set(
        {"unreadNotificationCount": firestore.Increment(1)}, merge=True
    )
    badge = (user_ref.get().to_dict() or {}).get("unreadNotificationCount", 0)

    send_expo_notifications(user_id, badge=badge)


def handle_notification_created(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None],
) -> None:
    notification = (event.data.to_dict() if event.data else None) or {}
    user_id = notification.get("userId")
    if not user_id:
        return

    try:
        increment_badge_and_notify(user_id)
    except Exception as exc:
        print(f"Error updating badge for notification: {exc}")


def handle_invite_created(
    event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None],
) -> None:
    invite = (event.data.to_dict() if event.data else None) or {}
    recipient = invite.get("recipient")
    if not recipient:
        return

    try:
        increment_badge_and_notify(recipient)
    except Exception as exc:
        print(f"Error updating badge for invite: {exc}")
