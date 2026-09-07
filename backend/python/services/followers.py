from datetime import datetime, timezone

from firebase_admin import firestore
from firebase_functions import firestore_fn

from services.user import get_user_info


def handle_sync_following(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    if event.data.after is not None:
        return

    user_id = event.params["userId"]
    follower_id = event.params["followerId"]

    db = firestore.client()
    db.collection("following").document(follower_id).collection(
        "following"
    ).document(user_id).delete()


def handle_sync_followers(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    user_a = event.params["userA"]
    user_b = event.params["userB"]
    new_data = event.data.after.to_dict() if event.data.after else None

    db = firestore.client()
    follower_doc_ref = (
        db.collection("followers")
        .document(user_b)
        .collection("followers")
        .document(user_a)
    )

    if not new_data:
        follower_doc_ref.delete()
        return

    now = datetime.now(timezone.utc)

    should_send_notification = True
    should_delete_notification = False
    if new_data.get("status") == "inactive":
        should_send_notification = False
        should_delete_notification = True

    try:
        existing_doc = follower_doc_ref.get()
        if existing_doc.exists:
            previous_followed_at = (existing_doc.to_dict() or {}).get("followedAt")
            if previous_followed_at:
                ten_minutes_seconds = 10 * 60
                elapsed_seconds = (now - previous_followed_at).total_seconds()
                if elapsed_seconds < ten_minutes_seconds:
                    should_send_notification = False
                    print("Not sending notification: followed recently")
    except Exception as exc:
        print(f"Error checking previous follow time: {exc}")

    follower_doc_ref.set(
        {
            "status": new_data.get("status"),
            "followedAt": new_data.get("followedAt"),
            "unfollowedAt": new_data.get("unfollowedAt"),
        },
        merge=True,
    )

    if should_send_notification and new_data.get("status") == "active":
        try:
            followed_user_info = get_user_info(user_a) or {}
            notification = {
                "type": "follow",
                "title": followed_user_info.get("name", ""),
                "body": f"({followed_user_info.get('username', '')}) started following you.",
                "timestamp": now,
                "userId": user_b,
                "senderId": user_a,
                "read": False,
            }
            db.collection("notifications").add(notification)
            print("Notification sent.")
        except Exception as exc:
            print(f"Error sending notification: {exc}")

    if should_delete_notification:
        try:
            query = (
                db.collection("notifications")
                .where("type", "==", "follow")
                .where("userId", "==", user_b)
                .where("senderId", "==", user_a)
            )
            for doc in query.stream():
                doc.reference.delete()
                print("Successfully deleted follow notification")
        except Exception as exc:
            print(f"Error deleting notification: {exc}")
