"""Cloud Functions for Firebase — Python codebase (stub).

Add real handlers here as you migrate endpoints from Node.
"""

from firebase_admin import initialize_app
from firebase_functions import https_fn, options
from firebase_functions.options import set_global_options

set_global_options(max_instances=10)
initialize_app()

EVENTFUL_CORS = options.CorsOptions(
    cors_origins=[r".*eventfulapp\.com$", "http://localhost:3000"],
    cors_methods=["get", "post", "options"],
)


@https_fn.on_request(cors=EVENTFUL_CORS)
def pyHello(req: https_fn.Request) -> https_fn.Response:
    """Minimal entry point — replace / extend as you port endpoints."""
    return https_fn.Response(
        response='{"ok":true,"message":"python codebase ready"}',
        status=200,
        headers={"Content-Type": "application/json"},
    )
