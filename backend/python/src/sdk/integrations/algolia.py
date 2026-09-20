from algoliasearch.search.client import SearchClientSync

_client: SearchClientSync | None = None


def _get_client(algolia_app_id, algolia_api_key) -> SearchClientSync:
    global _client
    if _client is None:
        _client = SearchClientSync(algolia_app_id.value, algolia_api_key.value)
    return _client


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


def search_users(
    algolia_app_id, algolia_api_key, query: str, hits_per_page: int, page: int
) -> dict:
    result = _get_client(algolia_app_id, algolia_api_key).search_single_index(
        index_name="user-search",
        search_params={
            "query": query,
            "hitsPerPage": hits_per_page,
            "page": page,
            "typoTolerance": True,
            "queryType": "prefixLast",
            "removeWordsIfNoResults": "lastWords",
            "attributesToRetrieve": ["uid", "username", "name", "searchName"],
        },
    )

    hits = [
        picked
        for picked in (_pick_user_fields(hit) for hit in result.to_dict().get("hits", []))
        if _is_searchable_user(picked)
    ]

    return {
        "query": query,
        "hitsPerPage": hits_per_page,
        "page": page,
        "nbHits": len(hits),
        "hits": hits,
    }
