from firebase_admin import app_check
from firebase_functions import https_fn


def verify_app_check(req: https_fn.Request) -> https_fn.Response | None:
    token = req.headers.get("X-Firebase-AppCheck")
    if not token:
        return https_fn.Response("Missing app token", status=400)

    try:
        app_check.verify_token(token)
        return None
    except Exception as exc:
        print(f"App Check verification failed: {exc}")
        return https_fn.Response("Unauthorized", status=401)
