import google.auth
import google.auth.transport.requests
import requests

GA4_BASE_URL = "https://analyticsdata.googleapis.com/v1beta"
GA4_ALPHA_BASE_URL = "https://analyticsdata.googleapis.com/v1alpha"
_SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]

_cachedCredentials = None


def _get_credentials():
    global _cachedCredentials
    if _cachedCredentials is None:
        credentials, _ = google.auth.default(scopes=_SCOPES)
        _cachedCredentials = credentials
    return _cachedCredentials


def _get_access_token() -> str:
    credentials = _get_credentials()
    if not credentials.valid:
        credentials.refresh(google.auth.transport.requests.Request())
    return credentials.token


def ga4_post(baseUrl: str, propertyId: str, body: dict, endpoint: str):
    token = _get_access_token()
    url = f"{baseUrl}/properties/{propertyId}:{endpoint}"
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.post(url, headers=headers, json=body, timeout=15)
    if not res.ok:
        raise Exception(f"GA4 {endpoint} failed: {res.status_code} {res.text}")
    return res.json()


def run_report(propertyId: str, body: dict) -> dict:
    return ga4_post(GA4_BASE_URL, propertyId, body, "runReport")


def run_funnel_report(propertyId: str, body: dict) -> dict:
    return ga4_post(GA4_ALPHA_BASE_URL, propertyId, body, "runFunnelReport")


def run_realtime_report(propertyId: str, body: dict) -> dict:
    return ga4_post(GA4_BASE_URL, propertyId, body, "runRealtimeReport")
