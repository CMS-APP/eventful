from firebase_admin import app_check
from firebase_functions import https_fn


def _verify_app_check(req: https_fn.Request) -> https_fn.Response | None:
    token = req.headers.get("X-Firebase-AppCheck")
    if not token:
        return https_fn.Response("Missing app token", status=400)

    try:
        app_check.verify_token(token)
        return None
    except Exception as exc:
        print(f"App Check verification failed: {exc}")
        return https_fn.Response("Unauthorized", status=401)


def handle_increment_stat_request(
    req: https_fn.Request,
    db,
    field_name: str,
    success_message: str,
    failure_message: str,
) -> https_fn.Response:
    app_check_error = _verify_app_check(req)
    if app_check_error:
        return app_check_error

    try:
        doc_ref = db.collection("stats").document("stats")
        doc_snap = doc_ref.get()

        if doc_snap.exists:
            current_value = doc_snap.to_dict().get(field_name, 0)
            doc_ref.update({field_name: current_value + 1})
        else:
            doc_ref.set({field_name: 1}, merge=True)

        return https_fn.Response(success_message, status=200)
    except Exception as exc:
        print(f"{failure_message}: {exc}")
        return https_fn.Response(failure_message, status=500)
