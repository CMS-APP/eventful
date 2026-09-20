from sdk.http_client import get, post

BASE_URL = "https://places.googleapis.com/v1"


def places_search(input_text: str, sessionToken: str, api_key: str):
    url = f"{BASE_URL}/places:autocomplete"
    headers = {"Content-Type": "application/json", "X-Goog-Api-Key": api_key}
    payload = {"input": input_text, "sessionToken": sessionToken}
    return post(url, headers=headers, json=payload)


def details_search(placeId: str, sessionToken: str, api_key: str):
    url = f"{BASE_URL}/places/{placeId}"
    headers = {"X-Goog-Api-Key": api_key, "X-Goog-FieldMask": "addressComponents,formattedAddress"}
    params = {"sessionToken": sessionToken}
    return get(url, headers=headers, params=params)
