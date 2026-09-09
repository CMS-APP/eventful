import google.auth
import google.auth.transport.requests
import requests

GA4_BASE_URL = "https://analyticsdata.googleapis.com/v1beta"
_SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]

_cached_credentials = None


def _get_credentials():
    global _cached_credentials
    if _cached_credentials is None:
        credentials, _ = google.auth.default(scopes=_SCOPES)
        _cached_credentials = credentials
    return _cached_credentials


def _get_access_token() -> str:
    credentials = _get_credentials()
    if not credentials.valid:
        credentials.refresh(google.auth.transport.requests.Request())
    return credentials.token


def run_report(property_id: str, body: dict) -> dict:
    token = _get_access_token()
    response = requests.post(
        f"{GA4_BASE_URL}/properties/{property_id}:runReport",
        headers={"Authorization": f"Bearer {token}"},
        json=body,
        timeout=15,
    )
    if not response.ok:
        raise Exception(
            f"GA4 runReport failed: {response.status_code} {response.text}"
        )
    return response.json()


def run_realtime_report(property_id: str, body: dict) -> dict:
    token = _get_access_token()
    response = requests.post(
        f"{GA4_BASE_URL}/properties/{property_id}:runRealtimeReport",
        headers={"Authorization": f"Bearer {token}"},
        json=body,
        timeout=15,
    )
    if not response.ok:
        raise Exception(
            f"GA4 runRealtimeReport failed: {response.status_code} {response.text}"
        )
    return response.json()
