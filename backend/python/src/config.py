from firebase_functions import options
from firebase_functions.options import set_global_options
from firebase_functions.params import SecretParam

set_global_options(max_instances=10, region="europe-west2")

cors_options = [r".*eventfulapp\.com$", "http://localhost:3000"]
CORS = options.CorsOptions(cors_origins=cors_options, cors_methods=["get", "post", "options"])

GOOG_PLA_API = SecretParam("GOOGLE_PLACES_API_KEY")
RECAPTCHA_SECRET = SecretParam("RECAPTCHA_SECRET")
MJ_API_KEY = SecretParam("MJ_API_KEY")
MJ_SECRET = SecretParam("MJ_SECRET")
ALG_APP_ID = SecretParam("ALGOLIA_APP_ID")
ALG_API_KEY = SecretParam("ALGOLIA_API_KEY")
RCS_API = SecretParam("REVENUECAT_SECRET_API_KEY")
GA4_ID = SecretParam("GA4_PROPERTY_ID")
RCP_ID = SecretParam("REVENUECAT_PROJECT_ID")
