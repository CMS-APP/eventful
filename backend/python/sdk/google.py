from sdk.https import get, post

BASE_URL = "https://places.googleapis.com/v1"


def places_search(input_text: str, session_token: str, api_key: str):
    url = f"{BASE_URL}/places:autocomplete"
    headers = {"Content-Type": "application/json", "X-Goog-Api-Key": api_key}
    payload = {"input": input_text, "sessionToken": session_token}
    return post(url, headers=headers, json=payload)


def details_search(place_id: str, session_token: str, api_key: str):
    url = f"{BASE_URL}/places/{place_id}"
    headers = {"X-Goog-Api-Key": api_key, "X-Goog-FieldMask": "addressComponents,formattedAddress"}
    params = {"sessionToken": session_token}
    return get(url, headers=headers, params=params)
