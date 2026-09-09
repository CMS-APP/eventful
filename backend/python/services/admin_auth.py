from firebase_admin import auth as firebase_auth
from firebase_admin import firestore
from firebase_functions import https_fn


def require_admin(req: https_fn.Request) -> https_fn.Response | None:
    auth_header = req.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None

    if not token:
        return https_fn.Response("Unauthorized", status=401)

    try:
        decoded = firebase_auth.verify_id_token(token)
        admin_doc = firestore.client().collection("admin").document("admin").get()
        uids = (admin_doc.to_dict() or {}).get("uids", []) if admin_doc.exists else []

        if decoded.get("uid") not in uids:
            return https_fn.Response("Unauthorized", status=401)
    except Exception as exc:
        print(f"Admin verification failed: {exc}")
        return https_fn.Response("Unauthorized", status=401)

    return None
