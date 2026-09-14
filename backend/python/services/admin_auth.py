from firebase_admin import auth

from sdk.firestore import get
from utils.https import response


def verify_token(token):
    result = auth.verify_id_token(token)
    return result.get("uid")


def admin_auth_error():
    return response("Unauthorized", 401)


def is_admin(req):
    auth_header = req.headers.get("Authorization", "")
    if not (token := auth_header[7:] if auth_header.startswith("Bearer ") else None):
        return False

    try:
        uid = verify_token(token)
        admin_doc = get("admin", "admin")
        uids = (admin_doc.to_dict() or {}).get("uids", []) if admin_doc.exists else []
        if uid not in uids:
            return False

    except Exception as exc:
        print(f"Admin verification failed: {exc}")
        return False

    return None
