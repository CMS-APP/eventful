from src.sdk.analytics.stats import feature_usage_stats, funnel_stats, realtime_active_users
from src.sdk.firebase.users import admin_auth_error, is_admin
from src.utils.https import format_request, require_method, response


def handle_feature_usage_request(req, property_id):
    if err := require_method(req, "GET"):
        return err
    if not is_admin(req):
        return admin_auth_error()

    req = format_request(req)
    days = req.get("days", 30)

    try:
        return response({"domains": feature_usage_stats(property_id, days)}, 200)
    except Exception as exc:
        print(f"GA4 feature usage report failed: {exc}")
        return response("Failed to fetch Firebase Analytics data", status=502)


def handle_funnel_request(req, property_id):
    if err := require_method(req, "GET"):
        return err
    if not is_admin(req):
        return admin_auth_error()

    req = format_request(req)
    days = req.get("days", 30)
    funnelParam = req.get("funnel", "")

    try:
        steps = funnel_stats(property_id, funnelParam, days)
    except Exception as exc:
        print(f"GA4 funnel report failed: {exc}")
        return response("Failed to fetch Firebase Analytics data", status=502)

    if steps is None:
        return response("Unknown funnel", status=400)
    return response({"steps": steps}, 200)


def handle_realtime_users_request(req, property_id):
    if err := require_method(req, "GET"):
        return err
    if not is_admin(req):
        return admin_auth_error()

    try:
        return response({"activeUsers": realtime_active_users(property_id)}, 200)
    except Exception as exc:
        print(f"GA4 realtime report failed: {exc}")
        return response("Failed to fetch Firebase Analytics data", status=502)
