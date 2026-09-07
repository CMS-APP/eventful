from firebase_admin import firestore


def get_user_info(user_id: str) -> dict | None:
    try:
        doc_snap = firestore.client().collection("user").document(user_id).get()
        return doc_snap.to_dict() if doc_snap.exists else None
    except Exception as exc:
        print(f"Error getting user details: {exc}")
        return None
