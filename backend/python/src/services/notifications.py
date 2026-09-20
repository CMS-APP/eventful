from src.sdk.notifications import recompute_and_notify
from src.utils.firestore_events import event_before_after


def _handle_badge_trigger(event, field: str, context: str) -> None:
    before, after = event_before_after(event)
    userId = (after or before or {}).get(field)
    if not userId:
        return

    try:
        recompute_and_notify(userId)
    except Exception as exc:
        print(f"Error updating badge for {context}: {exc}")


def handle_notification_written(event):
    _handle_badge_trigger(event, "userId", "notification")


def handle_invite_written(event):
    _handle_badge_trigger(event, "recipient", "invite")
