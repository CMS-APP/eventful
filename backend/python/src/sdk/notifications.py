from firebase_admin import firestore

from src.sdk.firebase.firestore import query
from src.sdk.integrations.expo_push import send_expo_notifications


def _count_unread_notifications(userId):
    docs = query("notifications", userId=userId).stream()
    return sum(1 for doc in docs if (doc.to_dict() or {}).get("read") is False)


def _count_pending_invites(userId):
    docs = query("invite", recipient=userId).stream()
    return sum(1 for doc in docs if (doc.to_dict() or {}).get("response") in ("pending", "maybe"))


def recompute_unread_badge(userId):
    badge = _count_unread_notifications(userId) + _count_pending_invites(userId)
    userRef = firestore.client().collection("user").document(userId)
    userRef.set({"unreadNotificationCount": badge}, merge=True)
    return badge


def recompute_and_notify(userId):
    badge = recompute_unread_badge(userId)
    send_expo_notifications(userId, badge=badge)
