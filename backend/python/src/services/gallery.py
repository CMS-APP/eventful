from src.sdk.gallery import get_gallery_info
from src.utils.https import format_request, require_method, response


def handle_gallery_info_request(req):
    if err := require_method(req, "GET"):
        return err

    req = format_request(req)
    userId = req.get("userId", "")
    hash_ = req.get("eventHash", "")
    if not userId or not hash_:
        return response("userId and eventHash are required", status=400)

    gallery = get_gallery_info(userId, hash_)
    if gallery is None:
        return response("Gallery not found", status=404)

    return response(gallery, 200)
