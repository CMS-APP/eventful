import json

import requests
from firebase_admin import app_check
from firebase_functions import https_fn

PLACES_API_BASE = "https://places.googleapis.com/v1"


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


def _string_param(req: https_fn.Request, key: str) -> str:
    if req.method == "GET":
        value = req.args.get(key, "")
    else:
        body = req.get_json(silent=True) or {}
        value = body.get(key, "")
    return str(value or "").strip()


def _pick_suggestion(suggestion: dict) -> dict | None:
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


def _pick_address_components(components: list | None) -> list:
    return [
        {
            "longText": component.get("longText"),
            "shortText": component.get("shortText"),
            "types": component.get("types", []),
        }
        for component in components or []
    ]


def _json_response(payload: dict, status: int = 200) -> https_fn.Response:
    return https_fn.Response(
        json.dumps(payload), status=status, headers={"Content-Type": "application/json"}
    )


def handle_autocomplete_request(
    req: https_fn.Request, api_key: str
) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)
    if req.method not in ("GET", "POST"):
        return https_fn.Response("Method Not Allowed", status=405)

    app_check_error = _verify_app_check(req)
    if app_check_error:
        return app_check_error

    input_text = _string_param(req, "input")
    if not input_text:
        return https_fn.Response("Missing input", status=400)

    session_token = _string_param(req, "sessionToken")
    if not session_token:
        return https_fn.Response("Missing sessionToken", status=400)

    try:
        places_res = requests.post(
            f"{PLACES_API_BASE}/places:autocomplete",
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": api_key,
            },
            json={"input": input_text, "sessionToken": session_token},
            timeout=10,
        )

        if not places_res.ok:
            print(f"Places autocomplete error: {places_res.status_code} {places_res.text}")
            return https_fn.Response("Places lookup failed", status=502)

        data = places_res.json()
        suggestions = [
            suggestion
            for suggestion in (
                _pick_suggestion(s) for s in data.get("suggestions", [])
            )
            if suggestion
        ]
        return _json_response({"suggestions": suggestions})
    except Exception as exc:
        print(f"Places autocomplete request failed: {exc}")
        return https_fn.Response("Search failed", status=500)


def handle_place_details_request(
    req: https_fn.Request, api_key: str
) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)
    if req.method not in ("GET", "POST"):
        return https_fn.Response("Method Not Allowed", status=405)

    app_check_error = _verify_app_check(req)
    if app_check_error:
        return app_check_error

    place_id = _string_param(req, "placeId")
    if not place_id:
        return https_fn.Response("Missing placeId", status=400)

    session_token = _string_param(req, "sessionToken")
    if not session_token:
        return https_fn.Response("Missing sessionToken", status=400)

    try:
        places_res = requests.get(
            f"{PLACES_API_BASE}/places/{place_id}",
            params={"sessionToken": session_token},
            headers={
                "X-Goog-Api-Key": api_key,
                "X-Goog-FieldMask": "addressComponents,formattedAddress",
            },
            timeout=10,
        )

        if not places_res.ok:
            print(f"Place details error: {places_res.status_code} {places_res.text}")
            return https_fn.Response("Place details lookup failed", status=502)

        data = places_res.json()
        return _json_response(
            {
                "formattedAddress": data.get("formattedAddress"),
                "addressComponents": _pick_address_components(
                    data.get("addressComponents")
                ),
            }
        )
    except Exception as exc:
        print(f"Place details request failed: {exc}")
        return https_fn.Response("Place details failed", status=500)


def handle_location_search_request(
    req: https_fn.Request, api_key: str
) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)

    action = _string_param(req, "action")

    if action == "autocomplete":
        return handle_autocomplete_request(req, api_key)
    if action == "details":
        return handle_place_details_request(req, api_key)

    return https_fn.Response("Missing or invalid action", status=400)
