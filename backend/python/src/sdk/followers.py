from datetime import datetime, timezone

from firebase_admin import firestore

from src.sdk.firebase.firestore import query
from src.sdk.firebase.users import get_user_info

FOLLOW_NOTIFICATION_COOLDOWN_SECONDS = 10 * 60


def remove_following(user_id: str, follower_id: str) -> None:
    db = firestore.client()
    followerDoc = db.collection("following").document(follower_id)
    followerDoc.collection("following").document(user_id).delete()


def sync_follower(user_a: str, user_b: str, data: dict | None) -> None:
    db = firestore.client()
    now = datetime.now(timezone.utc)
    followerDoc = (
        db.collection("following").document(user_b).collection("followers").document(user_a)
    )

    if not data:
        followerDoc.delete()
        return

    shouldSendNotification = True
    shouldDeleteNotification = False
    if data.get("status") == "inactive":
        shouldSendNotification = False
        shouldDeleteNotification = True

    existingDoc = followerDoc.get()
    if existingDoc.exists:
        previousFollowedAt = (existingDoc.to_dict() or {}).get("followedAt")
        if previousFollowedAt:
            seconds = (now - previousFollowedAt).total_seconds()
            if seconds < FOLLOW_NOTIFICATION_COOLDOWN_SECONDS:
                shouldSendNotification = False
                print("Not sending notification: followed recently")

    followerDoc.set(
        {
            "status": data.get("status"),
            "followedAt": data.get("followedAt"),
            "unfollowedAt": data.get("unfollowedAt"),
        },
        merge=True,
    )

    if shouldSendNotification and data.get("status") == "active":
        followedUserInfo = get_user_info(user_a) or {}
        notification = {
            "type": "follow",
            "title": followedUserInfo.get("name", ""),
            "body": f"({followedUserInfo.get('username', '')}) started following you.",
            "timestamp": now,
            "userId": user_b,
            "senderId": user_a,
            "read": False,
        }
        db.collection("notifications").add(notification)
        print("Notification sent.")

    if shouldDeleteNotification:
        matches = query("notifications", type="follow", userId=user_b, senderId=user_a)
        for doc in matches.stream():
            doc.reference.delete()
            print("Successfully deleted follow notification")
