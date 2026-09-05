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


def backfill_total_user_stats() -> dict[str, int]:
    db = firestore.client()
    counts_by_date: dict[str, int] = {}
    undated_count = 0

    for doc in db.collection("user").stream():
        created = (doc.to_dict() or {}).get("usernameCreateDate")
        if created is None:
            undated_count += 1
            continue
        if hasattr(created, "timestamp"):
            created = datetime.fromtimestamp(created.timestamp(), tz=timezone.utc)
        date_key = created.strftime("%Y-%m-%d")
        counts_by_date[date_key] = counts_by_date.get(date_key, 0) + 1

    if not counts_by_date:
        return {}

    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    start = datetime.strptime(min(counts_by_date), "%Y-%m-%d")
    end = datetime.strptime(max(max(counts_by_date), yesterday), "%Y-%m-%d")

    written: dict[str, int] = {}
    cumulative = undated_count
    batch = db.batch()
    pending = 0
    cursor = start

    while cursor <= end:
        key = cursor.strftime("%Y-%m-%d")
        cumulative += counts_by_date.get(key, 0)
        ref = db.collection(TOTAL_USER_STATS_COLLECTION).document(key)
        batch.set(
            ref,
            {
                "date": key,
                "totalUsers": cumulative,
                "createdAt": firestore.SERVER_TIMESTAMP,
                "backfilled": True,
            },
        )
        written[key] = cumulative
        pending += 1
        if pending == 400:
            batch.commit()
            batch = db.batch()
            pending = 0
        cursor += timedelta(days=1)

    if pending:
        batch.commit()

    return written
