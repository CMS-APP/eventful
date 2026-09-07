from firebase_functions import https_fn

from services.app_check import verify_app_check


def handle_increment_stat_request(
    req: https_fn.Request,
    db,
    field_name: str,
    success_message: str,
    failure_message: str,
) -> https_fn.Response:
    app_check_error = verify_app_check(req)
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
