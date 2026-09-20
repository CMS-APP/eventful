from src.sdk.firebase.firestore import query
from src.sdk.firebase.users import get_user_info
from src.sdk.hash import event_hash


def get_gallery_info(user_id: str, hash_: str) -> dict | None:
    photos = query("photoBoothPhotos", userId=user_id)
    matches = [(d.to_dict() or {}) for d in photos.stream()]
    matches = [d for d in matches if event_hash(d.get("eventTitle", "")) == hash_]

    if not matches:
        return None

    event_title = matches[0].get("eventTitle", "")
    created_at_list = [photo["createdAt"] for photo in matches if photo.get("createdAt")]
    earliest = min(created_at_list, default=None)
    user_info = get_user_info(user_id) or {}
    host_name = user_info.get("name") or user_info.get("username")
    date = earliest.isoformat() if earliest else None

    return {"eventTitle": event_title, "date": date, "hostName": host_name}
