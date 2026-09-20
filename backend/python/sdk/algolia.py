from algoliasearch.search.client import SearchClientSync

_client: SearchClientSync | None = None


def _get_client(algolia_app_id, algolia_api_key) -> SearchClientSync:
    global _client
    if _client is None:
        _client = SearchClientSync(algolia_app_id.value, algolia_api_key.value)
    return _client


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
    return result.to_dict()
