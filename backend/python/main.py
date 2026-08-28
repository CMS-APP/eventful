from firebase_admin import initialize_app
from firebase_functions import https_fn, options
from firebase_functions.options import set_global_options
from firebase_functions.params import SecretParam

from services.google_places import handle_location_search_request

set_global_options(max_instances=10)
initialize_app()

EVENTFUL_CORS = options.CorsOptions(
    cors_origins=[r".*eventfulapp\.com$", "http://localhost:3000"],
    cors_methods=["get", "post", "options"],
)

GOOGLE_PLACES_API_KEY = SecretParam("GOOGLE_PLACES_API_KEY")


@https_fn.on_request(
    cors=EVENTFUL_CORS,
    secrets=[GOOGLE_PLACES_API_KEY],
    min_instances=1,
)
def locationSearch(req: https_fn.Request) -> https_fn.Response:
    return handle_location_search_request(req, GOOGLE_PLACES_API_KEY.value)
