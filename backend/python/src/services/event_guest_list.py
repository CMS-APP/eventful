from firebase_functions import https_fn

from src.sdk.event_guest_list import (
    GuestListError,
    get_event_guest_list,
    get_public_event_guest_list,
)
from src.sdk.firebase.users import verify_token
from src.utils.https import format_request, get_bearer_token, require_method, response


def handle_event_guest_list_request(req: https_fn.Request) -> https_fn.Response:
    if err := require_method(req, "GET"):
        return err

    args = format_request(req)
    if not (eventId := args.get("eventId")):
        return response("Missing required fields", 400)

    try:
        if token := get_bearer_token(req):
            try:
                viewerUid = verify_token(token)
            except Exception:
                return response("Unauthorized", 401)
            guests = get_event_guest_list(eventId, viewerUid)
        else:
            guests = get_public_event_guest_list(eventId)
    except GuestListError as exc:
        return response(exc.message, exc.status)
    except Exception as exc:
        print(f"Error getting event guest list: {exc}")
        return response("Internal Server Error", 500)

    return response({"guests": guests}, 200)
