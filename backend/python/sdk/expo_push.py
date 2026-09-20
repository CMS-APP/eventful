from firebase_admin import firestore

from sdk.http_client import post

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_push_messages(messages: list[dict]) -> None:
    try:
        response = post(EXPO_PUSH_URL, json=messages)
        print(f"Expo notifications sent: {response.status_code} {response.text}")
    except Exception as exc:
        print(f"Error sending Expo notifications: {exc}")


def send_expo_notifications(
    userId: str,
    title: str | None = None,
    body: str | None = None,
    badge: int | None = None,
) -> None:
    db = firestore.client()
    user_doc = db.collection("user").document(userId).get()

    if not user_doc.exists:
        print(f"User not found: {userId}")
        return

    push_tokens = (user_doc.to_dict() or {}).get("pushTokens", [])
    valid_tokens = [
        token
        for token in push_tokens
        if isinstance(token, str) and token.startswith("ExponentPushToken")
    ]

    if not valid_tokens:
        print(f"No valid Expo push tokens for user: {userId}")
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

    send_push_messages(messages)
