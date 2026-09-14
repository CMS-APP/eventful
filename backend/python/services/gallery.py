from sdk.firestore import query
from sdk.hash import event_hash
from services.user import get_user_info
from utils.https import format_request, response


def handle_gallery_info_request(req):
    if req.method != "GET":
        return response("Method Not Allowed", status=405)
    req = format_request(req)

    user_id = req.get("userId", "")
    hash = req.get("eventHash", "")
    if not user_id or not hash:
        return response("userId and eventHash are required", status=400)

    photos = query("photoBoothPhotos", userId=user_id)
    matches = [(d.to_dict() or {}) for d in photos.stream()]
    matches = [d for d in matches if event_hash(d.get("eventTitle", "")) == hash]

    if not matches:
        return response("Gallery not found", status=404)

    event_title = matches[0].get("eventTitle", "")
    created_at_list = [photo["createdAt"] for photo in matches if photo.get("createdAt")]
    earliest = min(created_at_list, default=None)
    user_info = get_user_info(user_id) or {}
    host_name = user_info.get("name") or user_info.get("username")
    date = earliest.isoformat() if earliest else None

    return response({"eventTitle": event_title, "date": date, "hostName": host_name}, 200)
