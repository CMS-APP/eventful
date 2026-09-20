from src.sdk.integrations.mailjet import send_feedback_emails
from src.utils.firestore_events import event_before_after


def handle_send_feedback_email(event, mj_api_key, mj_secret):
    feedbackId = event.params["feedbackId"]
    oldData, newData = event_before_after(event)

    if oldData or not newData:
        return

    try:
        send_feedback_emails(mj_api_key, mj_secret, feedbackId, newData)
    except Exception as exc:
        print(f"Error sending feedback email: {exc}")
