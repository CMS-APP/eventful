import hashlib
import json
import re

from firebase_admin import firestore
from firebase_functions import https_fn

from services.user import get_user_info


def _convert_event_title_to_hash(event_title: str) -> str:
    clean_title = re.sub(r"\s+", "-", re.sub(r"[^a-z0-9\s]", "", event_title.strip().lower()))
    return hashlib.sha256(clean_title.encode("utf-8")).hexdigest()[:16]


def _json_response(payload: dict, status: int = 200) -> https_fn.Response:
    return https_fn.Response(
        json.dumps(payload), status=status, headers={"Content-Type": "application/json"}
    )


def handle_gallery_info_request(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)
    if req.method != "GET":
        return https_fn.Response("Method Not Allowed", status=405)

    user_id = req.args.get("userId", "")
    event_hash = req.args.get("eventHash", "")

    if not user_id or not event_hash:
        return https_fn.Response("userId and eventHash are required", status=400)

    photos_query = (
        firestore.client().collection("photoBoothPhotos").where("userId", "==", user_id)
    )
    matches = [
        doc.to_dict()
        for doc in photos_query.stream()
        if _convert_event_title_to_hash(doc.to_dict().get("eventTitle", "")) == event_hash
    ]

    if not matches:
        return https_fn.Response("Gallery not found", status=404)

    event_title = matches[0].get("eventTitle", "")
    earliest = min(
        (photo["createdAt"] for photo in matches if photo.get("createdAt")),
        default=None,
    )

    user_info = get_user_info(user_id) or {}
    host_name = user_info.get("name") or user_info.get("username")

    return _json_response(
        {
            "eventTitle": event_title,
            "date": earliest.isoformat() if earliest else None,
            "hostName": host_name,
        }
    )
