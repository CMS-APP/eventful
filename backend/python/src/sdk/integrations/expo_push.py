from firebase_admin import firestore

from src.sdk.integrations.http_client import post

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def send_push_messages(messages):
    try:
        response = post(EXPO_PUSH_URL, json=messages)
        print(f"Expo notifications sent: {response.status_code} {response.text}")
    except Exception as exc:
        print(f"Error sending Expo notifications: {exc}")


def send_expo_notifications(userId, title="", body="", badge=None):
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
        message = {"to": token, "title": title, "body": body}
        if title or body:
            message["sound"] = "default"
        if badge is not None:
            message["badge"] = badge
        messages.append(message)

    send_push_messages(messages)
