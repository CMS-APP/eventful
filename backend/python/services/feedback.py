from datetime import datetime, timezone

from firebase_functions import firestore_fn

from services.email import (
    send_feedback_confirmation_email_mailjet,
    send_feedback_email_mailjet,
)
from services.user import get_user_info


def handle_send_feedback_email(
    event: firestore_fn.Event[firestore_fn.Change[firestore_fn.DocumentSnapshot | None]],
    mj_api_key,
    mj_secret,
) -> None:
    feedback_id = event.params["feedbackId"]
    new_data = event.data.after.to_dict() if event.data.after else None
    old_data = event.data.before.to_dict() if event.data.before else None

    if old_data or not new_data:
        return

    try:
        timestamp = new_data.get("timestamp") or datetime.now(timezone.utc)
        timestamp_string = timestamp.isoformat()

        name = ""
        user_id = new_data.get("userId")
        if user_id:
            user = get_user_info(user_id)
            name = (user or {}).get("name") or ""

        feedback_data = {
            "message": new_data.get("message") or "",
            "email": new_data.get("email") or "",
            "name": name,
            "type": new_data.get("type") or "general",
            "username": new_data.get("username") or "Anonymous",
            "timestamp": timestamp_string,
        }

        send_feedback_email_mailjet(mj_api_key, mj_secret, feedback_data)
        send_feedback_confirmation_email_mailjet(mj_api_key, mj_secret, feedback_data)
        print(f"Feedback emails sent for document: {feedback_id}")
    except Exception as exc:
        print(f"Error sending feedback email: {exc}")
