from src.sdk.integrations.http_client import get, post

BASE_URL = "https://places.googleapis.com/v1"


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


def _pick_address_components(components: list) -> list[dict]:
    return [
        {
            "longText": c.get("longText"),
            "shortText": c.get("shortText"),
            "types": c.get("types", []),
        }
        for c in components or []
    ]


def autocomplete(input_text: str, session_token: str, api_key: str) -> list[dict]:
    url = f"{BASE_URL}/places:autocomplete"
    headers = {"Content-Type": "application/json", "X-Goog-Api-Key": api_key}
    payload = {"input": input_text, "sessionToken": session_token}
    res = post(url, headers=headers, json=payload)
    if not res.ok:
        raise RuntimeError(f"Places autocomplete error: {res.status_code} {res.text}")

    data = res.json()
    return [suggestion for s in data.get("suggestions", []) if (suggestion := _pick_suggestion(s))]


def place_details(place_id: str, session_token: str, api_key: str) -> dict:
    url = f"{BASE_URL}/places/{place_id}"
    headers = {"X-Goog-Api-Key": api_key, "X-Goog-FieldMask": "addressComponents,formattedAddress"}
    params = {"sessionToken": session_token}
    res = get(url, headers=headers, params=params)
    if not res.ok or not (data := res.json()):
        raise RuntimeError(f"Place details error: {res.status_code} {res.text}")

    return {
        "formattedAddress": data.get("formattedAddress"),
        "addressComponents": _pick_address_components(data.get("addressComponents")),
    }
