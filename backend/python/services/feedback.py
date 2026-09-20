from datetime import datetime, timezone

from sdk.mailjet import send_feedback_confirmation_email, send_feedback_email
from sdk.users import get_user_info


def handle_send_feedback_email(event, mj_api_key, mj_secret):
    feedbackId = event.params["feedbackId"]
    newData = event.data.after.to_dict() if event.data.after else None
    oldData = event.data.before.to_dict() if event.data.before else None

    if oldData or not newData:
        return

    try:
        timestamp = newData.get("timestamp") or datetime.now(timezone.utc)
        timestampString = timestamp.isoformat()

        name = ""
        userId = newData.get("userId")
        if userId:
            user = get_user_info(userId)
            name = (user or {}).get("name") or ""

        data = {
            "message": newData.get("message") or "",
            "email": newData.get("email") or "",
            "name": name,
            "type": newData.get("type") or "general",
            "username": newData.get("username") or "Anonymous",
            "timestamp": timestampString,
        }

        send_feedback_email(mj_api_key, mj_secret, data)
        send_feedback_confirmation_email(mj_api_key, mj_secret, data)
        print(f"Feedback emails sent for document: {feedbackId}")
    except Exception as exc:
        print(f"Error sending feedback email: {exc}")
