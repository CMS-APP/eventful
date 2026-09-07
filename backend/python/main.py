import re

from firebase_admin import firestore, initialize_app
from firebase_functions import firestore_fn, https_fn, options, scheduler_fn
from firebase_functions.options import set_global_options
from firebase_functions.params import SecretParam

from services.active_users import snapshot_active_users
from services.algolia_user_search import handle_search_users_request
from services.auth_http import (
    handle_forgot_password_request,
    handle_send_verification_email_request,
)
from services.event_responses import handle_respond_to_event_request
from services.feedback import handle_send_feedback_email
from services.followers import handle_sync_followers, handle_sync_following
from services.google_places import handle_location_search_request
from services.notifications import handle_invite_written, handle_notification_written
from services.stats import handle_increment_stat_request
from services.total_users import snapshot_total_users

set_global_options(max_instances=10, region="europe-west2")
initialize_app()

EVENTFUL_CORS = options.CorsOptions(
    cors_origins=[r".*eventfulapp\.com$", "http://localhost:3000"],
    cors_methods=["get", "post", "options"],
)

EVENTFUL_CORS_STRICT = options.CorsOptions(
    cors_origins=[r".*eventfulapp\.com$"],
    cors_methods=["get", "post", "options"],
)

ALLOW_ALL_CORS = options.CorsOptions(
    cors_origins=re.compile(r".*"),
    cors_methods=["get", "post", "options"],
)

GOOGLE_PLACES_API_KEY = SecretParam("GOOGLE_PLACES_API_KEY")
RECAPTCHA_SECRET = SecretParam("RECAPTCHA_SECRET")
MJ_API_KEY = SecretParam("MJ_API_KEY")
MJ_SECRET = SecretParam("MJ_SECRET")
ALGOLIA_APP_ID = SecretParam("ALGOLIA_APP_ID")
ALGOLIA_API_KEY = SecretParam("ALGOLIA_API_KEY")


@https_fn.on_request(
    cors=EVENTFUL_CORS,
    secrets=[GOOGLE_PLACES_API_KEY],
    min_instances=1,
)
def locationSearch(req: https_fn.Request) -> https_fn.Response:
    return handle_location_search_request(req, GOOGLE_PLACES_API_KEY.value)


@https_fn.on_request(cors=ALLOW_ALL_CORS)
def incrementUserCount(req: https_fn.Request) -> https_fn.Response:
    return handle_increment_stat_request(
        req,
        firestore.client(),
        "userCount",
        "User count incremented",
        "Error incrementing user count",
    )


@https_fn.on_request(cors=ALLOW_ALL_CORS)
def incrementEventCount(req: https_fn.Request) -> https_fn.Response:
    return handle_increment_stat_request(
        req,
        firestore.client(),
        "eventCount",
        "Event count incremented",
        "Error incrementing event count",
    )


@firestore_fn.on_document_written(
    document="followers/{userId}/followers/{followerId}",
)
def syncFollowing(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    handle_sync_following(event)


@firestore_fn.on_document_written(
    document="following/{userA}/following/{userB}",
)
def syncFollowers(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    handle_sync_followers(event)


@firestore_fn.on_document_written(
    document="notifications/{notificationId}",
)
def notificationWritten(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    handle_notification_written(event)


@firestore_fn.on_document_written(
    document="invite/{inviteId}",
)
def inviteWritten(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    handle_invite_written(event)


@scheduler_fn.on_schedule(
    schedule="0 0 * * *",
    timezone=scheduler_fn.Timezone("UTC"),
)
def snapshotActiveUsers(event: scheduler_fn.ScheduledEvent) -> None:
    snapshot_active_users(event.schedule_time)


@scheduler_fn.on_schedule(
    schedule="0 0 * * *",
    timezone=scheduler_fn.Timezone("UTC"),
)
def snapshotTotalUsers(event: scheduler_fn.ScheduledEvent) -> None:
    snapshot_total_users(event.schedule_time)


@https_fn.on_request(cors=EVENTFUL_CORS_STRICT, secrets=[RECAPTCHA_SECRET])
def respondToEvent(req: https_fn.Request) -> https_fn.Response:
    return handle_respond_to_event_request(req, RECAPTCHA_SECRET)


@https_fn.on_request(
    cors=ALLOW_ALL_CORS,
    secrets=[MJ_API_KEY, MJ_SECRET],
    min_instances=1,
)
def sendVerificationEmail(req: https_fn.Request) -> https_fn.Response:
    return handle_send_verification_email_request(req, MJ_API_KEY, MJ_SECRET)


@https_fn.on_request(
    cors=EVENTFUL_CORS_STRICT,
    secrets=[RECAPTCHA_SECRET, MJ_API_KEY, MJ_SECRET],
)
def forgotPassword(req: https_fn.Request) -> https_fn.Response:
    return handle_forgot_password_request(req, RECAPTCHA_SECRET, MJ_API_KEY, MJ_SECRET)


@https_fn.on_request(
    cors=EVENTFUL_CORS_STRICT,
    secrets=[ALGOLIA_APP_ID, ALGOLIA_API_KEY],
    min_instances=1,
)
def searchUsers(req: https_fn.Request) -> https_fn.Response:
    return handle_search_users_request(req, ALGOLIA_APP_ID, ALGOLIA_API_KEY)


@firestore_fn.on_document_written(
    document="feedback/{feedbackId}",
    secrets=[MJ_API_KEY, MJ_SECRET],
)
def sendFeedbackEmail(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    handle_send_feedback_email(event, MJ_API_KEY, MJ_SECRET)
