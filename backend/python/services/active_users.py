from datetime import datetime, timedelta, timezone

from firebase_admin import firestore


def snapshot_active_users() -> None:
    db = firestore.client()
    now = datetime.now(timezone.utc)
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

    date = now.strftime("%Y-%m-%d")
    db.collection("activeUserStats").document(date).set(
        {
            "date": date,
            "dau": dau,
            "wau": wau,
            "mau": mau,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
    )
