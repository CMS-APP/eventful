from firebase_functions import https_fn

from src.sdk.firebase.app_check import app_check_error, verify_app_check
from src.sdk.integrations.google import autocomplete, place_details
from src.utils.https import format_request, require_method, response


def _handle_autocomplete(req, api_key: str):
    if not (input_text := req.get("input", "")):
        return response("Missing input", status=400)
    if not (session_token := req.get("sessionToken", "")):
        return response("Missing sessionToken", status=400)

    try:
        suggestions = autocomplete(input_text, session_token, api_key)
        return response({"suggestions": suggestions}, 200)
    except Exception as exc:
        print(f"Places autocomplete request failed: {exc}")
        return response("Search failed", status=500)


def _handle_place_details(req, api_key: str):
    if not (place_id := req.get("placeId")):
        return response("Missing placeId", status=400)
    if not (session_token := req.get("sessionToken")):
        return response("Missing sessionToken", status=400)

    try:
        return response(place_details(place_id, session_token, api_key), 200)
    except Exception as exc:
        print(f"Place details request failed: {exc}")
        return response("Place details failed", status=500)


def handle_location_search_request(req, api_key: str) -> https_fn.Response:
    print("Handling location search request")
    if err := require_method(req, "POST"):
        return err
    if not verify_app_check(req):
        return app_check_error()

    req = format_request(req)
    action = req.get("action", "")
    if action == "autocomplete":
        return _handle_autocomplete(req, api_key)
    if action == "details":
        return _handle_place_details(req, api_key)

    return response("Missing or invalid action", status=400)
