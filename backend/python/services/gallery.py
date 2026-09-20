from sdk.firestore import query
from sdk.hash import event_hash
from sdk.users import get_user_info
from utils.https import format_request, response


def handle_gallery_info_request(req):
    if req.method != "GET":
        return response("Method Not Allowed", status=405)

    req = format_request(req)
    userId = req.get("userId", "")
    hash = req.get("eventHash", "")
    if not userId or not hash:
        return response("userId and eventHash are required", status=400)

    photos = query("photoBoothPhotos", userId=userId)
    matches = [(d.to_dict() or {}) for d in photos.stream()]
    matches = [d for d in matches if event_hash(d.get("eventTitle", "")) == hash]

    if not matches:
        return response("Gallery not found", status=404)

    eventTitle = matches[0].get("eventTitle", "")
    createdAtList = [photo["createdAt"] for photo in matches if photo.get("createdAt")]
    earliest = min(createdAtList, default=None)
    userInfo = get_user_info(userId) or {}
    hostName = userInfo.get("name") or userInfo.get("username")
    date = earliest.isoformat() if earliest else None

    return response({"eventTitle": eventTitle, "date": date, "hostName": hostName}, 200)
