from firebase_admin import app_check

from utils.https import response


def verify_app_check(req):
    if not (token := req.headers.get("X-Firebase-AppCheck")):
        return response("Missing app token", status=400)

    try:
        app_check.verify_token(token)
        return True
    except Exception as exc:
        print(f"App Check verification failed: {exc}")
        return False


def app_check_error():
    return response("Unauthorized", status=401)
