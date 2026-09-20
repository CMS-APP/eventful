from src.sdk.followers import remove_following, sync_follower
from src.utils.firestore_events import event_before_after


def handle_sync_following(event) -> None:
    if event.data.after is not None:
        return

    remove_following(event.params["userId"], event.params["followerId"])


def handle_sync_followers(event):
    _, data = event_before_after(event)
    sync_follower(event.params["userA"], event.params["userB"], data)
