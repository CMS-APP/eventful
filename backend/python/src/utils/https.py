import json

from firebase_functions import https_fn


def format_request(req):
    if req.method == "GET":
        return req.args
    return req.get_json(silent=True) or {}


def response(body, status: int):
    headers = None
    if not isinstance(body, str):
        body = json.dumps(body)
        headers = {"Content-Type": "application/json"}
    return https_fn.Response(response=body, status=status, headers=headers)


def require_method(req, method: str) -> https_fn.Response | None:
    if req.method != method:
        return response("Method Not Allowed", status=405)
    return None
