from firebase_admin import initialize_app
from firebase_functions import firestore_fn, https_fn, options, scheduler_fn
from firebase_functions.options import set_global_options
from firebase_functions.params import SecretParam

from services.active_users import snapshot_active_users
from services.followers import handle_sync_following
from services.google_places import handle_location_search_request
from services.notifications import handle_invite_written, handle_notification_written
from services.total_users import snapshot_total_users

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


@firestore_fn.on_document_written(
    document="followers/{userId}/followers/{followerId}",
    region="europe-west2",
)
def syncFollowing(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    handle_sync_following(event)


@firestore_fn.on_document_written(
    document="notifications/{notificationId}",
    region="europe-west2",
)
def notificationWritten(
    event: firestore_fn.Event[
        firestore_fn.Change[firestore_fn.DocumentSnapshot | None]
    ],
) -> None:
    handle_notification_written(event)


@firestore_fn.on_document_written(
    document="invite/{inviteId}",
    region="europe-west2",
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
