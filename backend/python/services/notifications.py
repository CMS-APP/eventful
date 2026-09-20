from firebase_admin import firestore

from sdk.expo_push import send_expo_notifications
from sdk.firestore import query


def _count_unread_notifications(userId: str) -> int:
    docs = query("notifications", userId=userId).stream()
    return sum(1 for doc in docs if (doc.to_dict() or {}).get("read") is False)


def _count_pending_invites(userId: str) -> int:
    docs = query("invite", recipient=userId).stream()
    return sum(1 for doc in docs if (doc.to_dict() or {}).get("response") in ("pending", "maybe"))


def recompute_unread_badge(userId: str) -> int:
    badge = _count_unread_notifications(userId) + _count_pending_invites(userId)
    userRef = firestore.client().collection("user").document(userId)
    userRef.set({"unreadNotificationCount": badge}, merge=True)
    return badge


def handle_notification_written(event):
    after = event.data.after.to_dict() if event.data.after else None
    before = event.data.before.to_dict() if event.data.before else None
    userId = (after or before or {}).get("userId")
    if not userId:
        return

    try:
        badge = recompute_unread_badge(userId)
        send_expo_notifications(userId, badge=badge)
    except Exception as exc:
        print(f"Error updating badge for notification: {exc}")


def handle_invite_written(event):
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
