import json

from algoliasearch.search.client import SearchClientSync
from firebase_functions import https_fn

from services.app_check import verify_app_check

_client: SearchClientSync | None = None


def _get_client(algolia_app_id, algolia_api_key) -> SearchClientSync:
    global _client
    if _client is None:
        _client = SearchClientSync(algolia_app_id.value, algolia_api_key.value)
    return _client


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


def handle_search_users_request(
    req: https_fn.Request, algolia_app_id, algolia_api_key
) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)
    if req.method not in ("GET", "POST"):
        return https_fn.Response("Method Not Allowed", status=405)

    app_check_error = verify_app_check(req)
    if app_check_error:
        return app_check_error

    body = req.get_json(silent=True) or {}
    q = _string_param(req, "q", body)
    if not q:
        return https_fn.Response("Missing query", status=400)

    hits_per_page = min(_parse_positive_int(_string_param(req, "limit", body), 20), 50)
    page = _parse_positive_int(_string_param(req, "page", body), 0)

    try:
        result = _get_client(algolia_app_id, algolia_api_key).search_single_index(
            index_name="user-search",
            search_params={
                "query": q,
                "hitsPerPage": hits_per_page,
                "page": page,
                "typoTolerance": True,
                "queryType": "prefixLast",
                "removeWordsIfNoResults": "lastWords",
                "attributesToRetrieve": ["uid", "username", "name", "searchName"],
            },
        )

        raw_hits = result.to_dict().get("hits", [])
        hits = [
            picked
            for picked in (_pick_user_fields(hit) for hit in raw_hits)
            if _is_searchable_user(picked)
        ]

        payload = {
            "query": q,
            "hitsPerPage": hits_per_page,
            "page": page,
            "nbHits": len(hits),
            "hits": hits,
        }
        return https_fn.Response(
            json.dumps(payload), status=200, headers={"Content-Type": "application/json"}
        )
    except Exception as exc:
        print(f"Algolia user search error: {exc}")
        return https_fn.Response("Search failed", status=500)
