from datetime import datetime, timedelta, timezone
from typing import cast

from firebase_admin import auth, firestore
from google.cloud.firestore import SERVER_TIMESTAMP
from google.cloud.firestore_v1.base_aggregation import AggregationResult

from src.sdk.firebase.firestore import get
from src.utils.https import get_bearer_token, response

TOTAL_USER_STATS_COLLECTION = "totalUserStats"


def get_user_info(userId: str) -> dict | None:
    try:
        doc_snap = firestore.client().collection("user").document(userId).get()
        return doc_snap.to_dict() if doc_snap.exists else None
    except Exception as exc:
        print(f"Error getting user details: {exc}")
        return None


def snapshot_total_users(as_of: datetime | None = None) -> None:
    db = firestore.client()
    now = as_of or datetime.now(timezone.utc)
    day = timedelta(days=1)

    aggregate = cast(list[list[AggregationResult]], db.collection("user").count().get())
    total_users = aggregate[0][0].value

    date = (now - day).strftime("%Y-%m-%d")
    db.collection(TOTAL_USER_STATS_COLLECTION).document(date).set(
        {
            "date": date,
            "totalUsers": total_users,
            "createdAt": SERVER_TIMESTAMP,
        }
    )


def snapshot_active_users(as_of: datetime | None = None) -> None:
    db = firestore.client()
    now = as_of or datetime.now(timezone.utc)
    day = timedelta(days=1)

    dau = 0
    wau = 0
    mau = 0

    for doc in db.collection("user").stream():
        last_launched_at = (doc.to_dict() or {}).get("lastLaunchedAt")
        if last_launched_at is None:
            continue

        age = now - last_launched_at
        if age <= day:
            dau += 1
        if age <= 7 * day:
            wau += 1
        if age <= 30 * day:
            mau += 1

    date = (now - day).strftime("%Y-%m-%d")
    snapshot = {"date": date, "dau": dau, "wau": wau, "mau": mau}
    db.collection("activeUserStats").document(date).set({**snapshot, "createdAt": SERVER_TIMESTAMP})


def verify_token(token):
    result = auth.verify_id_token(token)
    return result.get("uid")


def admin_auth_error():
    return response("Unauthorized", 401)


def is_admin(req):
    if not (token := get_bearer_token(req)):
        return False

    try:
        uid = verify_token(token)
        admin_doc = get("admin", "admin")
        uids = (admin_doc.to_dict() or {}).get("uids", []) if admin_doc.exists else []
        if uid not in uids:
            return False

    except Exception as exc:
        print(f"Admin verification failed: {exc}")
        return False

    return True
