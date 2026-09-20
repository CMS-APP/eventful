from src.sdk.firebase.users import admin_auth_error, is_admin
from src.sdk.integrations.revenuecat import subscription_stats
from src.utils.https import format_request, require_method, response


def handle_subscriptions_request(req, apiKey, projectId):
    if err := require_method(req, "GET"):
        return err
    if not is_admin(req):
        return admin_auth_error()

    req = format_request(req)
    days = int(req.get("days", 30))

    try:
        return response(subscription_stats(projectId, apiKey, days), 200)
    except Exception as exc:
        print(f"RevenueCat charts fetch failed: {exc}")
        return response({"error": "Failed to fetch RevenueCat data"}, status=502)
