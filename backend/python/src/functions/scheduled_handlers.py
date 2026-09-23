from firebase_functions import scheduler_fn

from src.sdk.firebase.users import (
    snapshot_active_users,
    snapshot_total_users,
    snapshot_users_by_country,
)


@scheduler_fn.on_schedule(schedule="0 0 * * *", timezone=scheduler_fn.Timezone("UTC"))
def snapshotActiveUsers(_event):
    snapshot_active_users()


@scheduler_fn.on_schedule(schedule="0 0 * * *", timezone=scheduler_fn.Timezone("UTC"))
def snapshotTotalUsers(_event):
    snapshot_total_users()


@scheduler_fn.on_schedule(schedule="0 0 * * *", timezone=scheduler_fn.Timezone("UTC"))
def snapshotUsersByCountry(_event):
    snapshot_users_by_country()
