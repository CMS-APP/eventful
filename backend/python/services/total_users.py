from datetime import datetime, timedelta, timezone

from firebase_admin import firestore

TOTAL_USER_STATS_COLLECTION = "totalUserStats"


def snapshot_total_users(as_of: datetime | None = None) -> None:
    db = firestore.client()
    now = as_of or datetime.now(timezone.utc)
    day = timedelta(days=1)

    aggregate = db.collection("user").count().get()
    total_users = aggregate[0][0].value

    date = (now - day).strftime("%Y-%m-%d")
    db.collection(TOTAL_USER_STATS_COLLECTION).document(date).set(
        {
            "date": date,
            "totalUsers": total_users,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
    )
