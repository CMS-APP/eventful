from firebase_admin import initialize_app
from firebase_functions import firestore_fn, https_fn, options, scheduler_fn
from firebase_functions.options import set_global_options
from firebase_functions.params import SecretParam

from services.active_users import snapshot_active_users
from services.algolia_user_search import handle_search_users_request
from services.analytics_stats import (
    handle_feature_usage_request,
    handle_funnel_request,
    handle_realtime_users_request,
)
from services.auth_http import (
    handle_forgot_password_request,
    handle_send_verification_email_request,
)
from services.event_responses import handle_respond_to_event_request
from services.feedback import handle_send_feedback_email
from services.followers import handle_sync_followers, handle_sync_following
from services.google_places import handle_location_search_request
from services.notifications import handle_invite_written, handle_notification_written
from services.photo_booth_gallery import handle_gallery_info_request
from services.revenuecat_stats import handle_subscriptions_request
from services.total_users import snapshot_total_users

set_global_options(max_instances=10, region="europe-west2")
initialize_app()

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


@firestore_fn.on_document_written(document="followers/{userId}/followers/{followerId}")
def syncFollowing(event):
    handle_sync_following(event)


@firestore_fn.on_document_written(document="following/{userA}/following/{userB}")
def syncFollowers(event):
    handle_sync_followers(event)


@firestore_fn.on_document_written(document="notifications/{notificationId}")
def notificationWritten(event):
    handle_notification_written(event)


@firestore_fn.on_document_written(document="invite/{inviteId}")
def inviteWritten(event):
    handle_invite_written(event)


@scheduler_fn.on_schedule(schedule="0 0 * * *", timezone=scheduler_fn.Timezone("UTC"))
def snapshotActiveUsers(_event):
    snapshot_active_users()


@scheduler_fn.on_schedule(schedule="0 0 * * *", timezone=scheduler_fn.Timezone("UTC"))
def snapshotTotalUsers(_event):
    snapshot_total_users()


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


@firestore_fn.on_document_written(document="feedback/{feedbackId}", secrets=[MJ_API_KEY, MJ_SECRET])
def sendFeedbackEmail(event):
    handle_send_feedback_email(event, MJ_API_KEY, MJ_SECRET)
