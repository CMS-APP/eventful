from datetime import datetime, timezone

from firebase_admin import firestore

from sdk.firestore import query
from sdk.users import get_user_info


def handle_sync_following(event) -> None:
    if event.data.after is not None:
        return

    userId = event.params["userId"]
    followerId = event.params["followerId"]

    db = firestore.client()
    followerDoc = db.collection("following").document(followerId)
    followerDoc.collection("following").document(userId).delete()


def handle_sync_followers(event):
    userA = event.params["userA"]
    userB = event.params["userB"]
    data = event.data.after.to_dict() if event.data.after else None

    db = firestore.client()
    now = datetime.now(timezone.utc)
    followerDoc = db.collection("following").document(userB).collection("followers").document(userA)

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
            tenMinutes = 10 * 60
            seconds = (now - previousFollowedAt).total_seconds()
            if seconds < tenMinutes:
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
        followedUserInfo = get_user_info(userA) or {}
        notification = {
            "type": "follow",
            "title": followedUserInfo.get("name", ""),
            "body": f"({followedUserInfo.get('username', '')}) started following you.",
            "timestamp": now,
            "userId": userB,
            "senderId": userA,
            "read": False,
        }
        db.collection("notifications").add(notification)
        print("Notification sent.")

    if shouldDeleteNotification:
        matches = query("notifications", type="follow", userId=userB, senderId=userA)
        for doc in matches.stream():
            doc.reference.delete()
            print("Successfully deleted follow notification")
