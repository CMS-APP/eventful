from firebase_admin import firestore
from firebase_functions import firestore_fn


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
