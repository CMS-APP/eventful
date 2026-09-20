from firebase_functions import https_fn

from src.config import (
    ALG_API_KEY,
    ALG_APP_ID,
    CORS,
    GA4_ID,
    GOOG_PLA_API,
    MJ_API_KEY,
    MJ_SECRET,
    RCP_ID,
    RCS_API,
    RECAPTCHA_SECRET,
)
from src.services.auth import (
    handle_forgot_password_request,
    handle_send_verification_email_request,
)
from src.services.event_responses import handle_respond_to_event_request
from src.services.gallery import handle_gallery_info_request
from src.services.location import handle_location_search_request
from src.services.stats import (
    handle_feature_usage_request,
    handle_funnel_request,
    handle_realtime_users_request,
)
from src.services.subscriptions import handle_subscriptions_request
from src.services.user_search import handle_search_users_request


@https_fn.on_request(cors=CORS, secrets=[GOOG_PLA_API])
def locationSearch(req):
    return handle_location_search_request(req, GOOG_PLA_API.value)


@https_fn.on_request(cors=CORS)
def galleryInfo(req):
    return handle_gallery_info_request(req)


@https_fn.on_request(cors=CORS, secrets=[GA4_ID])
def analyticsFeatureUsage(req):
    return handle_feature_usage_request(req, GA4_ID.value)


@https_fn.on_request(cors=CORS, secrets=[GA4_ID])
def analyticsFunnel(req):
    return handle_funnel_request(req, GA4_ID.value)


@https_fn.on_request(cors=CORS, secrets=[GA4_ID])
def analyticsRealtimeUsers(req):
    return handle_realtime_users_request(req, GA4_ID.value)


@https_fn.on_request(cors=CORS, secrets=[RCS_API, RCP_ID])
def subscriptionStats(req):
    return handle_subscriptions_request(req, RCS_API.value, RCP_ID.value)


@https_fn.on_request(cors=CORS, secrets=[RECAPTCHA_SECRET])
def respondToEvent(req):
    return handle_respond_to_event_request(req, RECAPTCHA_SECRET)


@https_fn.on_request(cors=CORS, secrets=[MJ_API_KEY, MJ_SECRET])
def sendVerificationEmail(req):
    return handle_send_verification_email_request(req, MJ_API_KEY, MJ_SECRET)


@https_fn.on_request(cors=CORS, secrets=[RECAPTCHA_SECRET, MJ_API_KEY, MJ_SECRET])
def forgotPassword(req):
    return handle_forgot_password_request(req, RECAPTCHA_SECRET, MJ_API_KEY, MJ_SECRET)


@https_fn.on_request(cors=CORS, secrets=[ALG_APP_ID, ALG_API_KEY], min_instances=1)
def searchUsers(req):
    return handle_search_users_request(req, ALG_APP_ID, ALG_API_KEY)
