from firebase_functions import https_fn

from sdk.algolia import search_users
from sdk.app_check import app_check_error, verify_app_check
from utils.https import format_request, response


def _parse_positive_int(value, fallback: int) -> int:
    try:
        parsed = int(value)
        return parsed if parsed > 0 else fallback
    except (TypeError, ValueError):
        return fallback


def _pick_user_fields(hit: dict) -> dict:
    return {
        "uid": hit.get("uid") or hit.get("objectID"),
        "username": hit.get("username"),
        "name": hit.get("name"),
        "searchName": hit.get("searchName"),
    }


def _is_searchable_user(user: dict) -> bool:
    if not user.get("uid"):
        return False
    name = (user.get("name") or "").strip()
    username = (user.get("username") or "").strip()
    return bool(name or username)


def _string_param(req: https_fn.Request, key: str, body: dict) -> str:
    value = req.args.get(key, "") if req.method == "GET" else body.get(key, "")
    return str(value or "").strip()


def handle_search_users_request(req, algolia_app_id, algolia_api_key):
    if not verify_app_check(req):
        return app_check_error()

    req = format_request(req)
    query = req.get("query", {})
    limit = int(req.get("limit", 20))
    page = int(req.get("page", 0))

    if not query:
        return response("Missing query", 400)

    try:
        result = search_users(algolia_app_id, algolia_api_key, query, limit, page)

        hits = result.get("hits", [])
        hits = [
            picked
            for picked in (_pick_user_fields(hit) for hit in hits)
            if _is_searchable_user(picked)
        ]

        payload = {
            "query": query,
            "hitsPerPage": limit,
            "page": page,
            "nbHits": len(hits),
            "hits": hits,
        }
        return response(payload, 200)
    except Exception as exc:
        print(f"Algolia user search error: {exc}")
        return response("Search failed", 500)
