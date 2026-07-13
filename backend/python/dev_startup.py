"""IPython startup for local backend work against production Firebase."""

import os
import sys

from firebase_admin import auth, firestore, initialize_app

os.environ.setdefault("GOOGLE_CLOUD_PROJECT", "eventful-23690")
os.environ.setdefault("GCLOUD_PROJECT", "eventful-23690")

try:
    initialize_app(options={"projectId": "eventful-23690"})
except ValueError:
    pass
except Exception as exc:
    print("Firebase Admin failed to initialize.")
    print(f"  {type(exc).__name__}: {exc}")
    print()
    print("Fix (one-time):")
    print("  gcloud auth application-default login")
    print("  gcloud config set project eventful-23690")
    print()
    print("Then re-run ./dev.sh")
    print()
    print("If gcloud is not installed: https://cloud.google.com/sdk/docs/install")
    sys.exit(1)

db = firestore.client()

print("Production Firebase ready (eventful-23690).")
print("Imports available: auth, firestore, db")
