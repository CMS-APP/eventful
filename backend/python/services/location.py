from firebase_functions import https_fn

from sdk.app_check import app_check_error, verify_app_check
from sdk.google import details_search, places_search
from utils.https import format_request, response

PLACES_API_BASE = "https://places.googleapis.com/v1"


def _pick_suggestion(suggestion):
    prediction = suggestion.get("placePrediction")
    if not prediction:
        return None

    structured = prediction.get("structuredFormat", {})
    return {
        "placeId": prediction.get("placeId"),
        "text": prediction.get("text", {}).get("text"),
        "mainText": structured.get("mainText", {}).get("text"),
        "secondaryText": structured.get("secondaryText", {}).get("text"),
    }


def _pick_address_components(c):
    return [
        {
            "longText": c.get("longText"),
            "shortText": c.get("shortText"),
            "types": c.get("types", []),
        }
        for c in c or []
    ]


def handle_autocomplete_request(req, api_key):
    if not (inputText := req.get("input", "")):
        return response("Missing input", status=400)
    if not (sessionToken := req.get("sessionToken", "")):
        return response("Missing sessionToken", status=400)

    try:
        res = places_search(inputText, sessionToken, api_key)
        if not res.ok:
            print(f"Places autocomplete error: {res.status_code} {res.text}")
            return response("Places lookup failed", status=502)

        data = res.json()
        suggestions = [s for s in (_pick_suggestion(s) for s in data.get("suggestions", [])) if s]
        return response({"suggestions": suggestions}, 200)
    except Exception as exc:
        print(f"Places autocomplete request failed: {exc}")
        return response("Search failed", status=500)


def handle_place_details_request(req, api_key):
    if not (placeId := req.get("placeId")):
        return response("Missing placeId", status=400)
    if not (sessionToken := req.get("sessionToken")):
        return response("Missing sessionToken", status=400)

    try:
        res = details_search(placeId, sessionToken, api_key)
        if not res.ok:
            print(f"Place details error: {res.status_code} {res.text}")
            return response("Place details lookup failed", status=502)

        data = res.json()
        address = data.get("formattedAddress")
        components = _pick_address_components(data.get("addressComponents"))
        return response({"formattedAddress": address, "addressComponents": components}, 200)
    except Exception as exc:
        print(f"Place details request failed: {exc}")
        return response("Place details failed", status=500)


def handle_location_search_request(req, api_key: str) -> https_fn.Response:
    if not verify_app_check(req):
        return app_check_error()

    req = format_request(req)
    action = req.get("action", "")
    if action == "autocomplete":
        return handle_autocomplete_request(req, api_key)
    if action == "details":
        return handle_place_details_request(req, api_key)

    return response("Missing or invalid action", status=400)
