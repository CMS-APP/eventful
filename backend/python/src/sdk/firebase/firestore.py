from firebase_admin import firestore


def query(collection: str, **queries):
    collection_ref = firestore.client().collection(collection)
    for field, value in queries.items():
        collection_ref = collection_ref.where(field, "==", value)
    return collection_ref


def get(collection: str, uid: str):
    return firestore.client().collection(collection).document(uid).get()
