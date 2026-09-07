from urllib.parse import parse_qs, urlencode, urlparse


def build_auth_action_link(page_url: str, mode: str, admin_generated_link: str) -> str:
    parsed_admin_link = urlparse(admin_generated_link)
    oob_code = parse_qs(parsed_admin_link.query).get("oobCode", [None])[0]

    parsed_page_url = urlparse(page_url)
    query = parse_qs(parsed_page_url.query)
    query["mode"] = [mode]
    query["oobCode"] = [oob_code]

    return parsed_page_url._replace(query=urlencode(query, doseq=True)).geturl()
