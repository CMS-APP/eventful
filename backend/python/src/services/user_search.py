from src.sdk.firebase.app_check import app_check_error, verify_app_check
from src.sdk.integrations.algolia import search_users
from src.utils.https import format_request, require_method, response


def handle_search_users_request(req, algolia_app_id, algolia_api_key):
    if err := require_method(req, "POST"):
        return err
    if not verify_app_check(req):
        return app_check_error()

    req = format_request(req)
    query = req.get("q", "")
    limit = int(req.get("limit", 20))
    page = int(req.get("page", 0))

    if not query:
        return response("Missing query", 400)

    try:
        return response(search_users(algolia_app_id, algolia_api_key, query, limit, page), 200)
    except Exception as exc:
        print(f"Algolia user search error: {exc}")
        return response("Search failed", 500)
