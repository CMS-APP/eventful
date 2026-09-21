"""One-off migration: copy profile photos into their own storage folder.

Copies every object at `{userId}/profilePicture.jpg` (bucket root) to
`profilePhotos/{userId}/profilePicture.jpg`. Copy-only, never deletes or
moves the original, so it is safe to re-run to pick up new signups or retry
failures - it will skip any destination object that already exists unless
--force is passed.

Runs against PRODUCTION Firebase (eventful-23690). Defaults to a dry run;
pass --apply to actually copy.

Usage:
    cd backend/python
    source venv/bin/activate  # or run ./dev.sh once first to create it
    python scripts/migrate_profile_photos.py            # dry run
    python scripts/migrate_profile_photos.py --apply     # do the copy
    python scripts/migrate_profile_photos.py --apply --force  # re-copy existing
"""

import argparse
import os
import re
import sys

from firebase_admin import initialize_app, storage

PROJECT_ID = "eventful-23690"
BUCKET_NAME = "eventful-23690.firebasestorage.app"
SOURCE_PATTERN = re.compile(r"^(?P<user_id>[^/]+)/profilePicture\.jpg$")
DEST_TEMPLATE = "profilePhotos/{user_id}/profilePicture.jpg"


def init_firebase():
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", PROJECT_ID)
    os.environ.setdefault("GCLOUD_PROJECT", PROJECT_ID)
    try:
        initialize_app(
            options={"projectId": PROJECT_ID, "storageBucket": BUCKET_NAME}
        )
    except ValueError:
        pass


def iter_source_blobs(bucket):
    for blob in bucket.list_blobs():
        match = SOURCE_PATTERN.match(blob.name)
        if match:
            yield blob, match.group("user_id")


def migrate(apply: bool, force: bool):
    bucket = storage.bucket()

    copied, skipped, errored = 0, 0, 0

    for blob, user_id in iter_source_blobs(bucket):
        dest_name = DEST_TEMPLATE.format(user_id=user_id)
        dest_blob = bucket.blob(dest_name)

        if not force and dest_blob.exists():
            skipped += 1
            print(f"skip (exists): {dest_name}")
            continue

        if not apply:
            print(f"would copy: {blob.name} -> {dest_name}")
            copied += 1
            continue

        try:
            bucket.copy_blob(blob, bucket, dest_name)
            copied += 1
            print(f"copied: {blob.name} -> {dest_name}")
        except Exception as exc:
            errored += 1
            print(f"ERROR copying {blob.name} -> {dest_name}: {exc}", file=sys.stderr)

    mode = "APPLY" if apply else "DRY RUN"
    print()
    print(f"[{mode}] copied={copied} skipped={skipped} errored={errored}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply", action="store_true", help="Actually copy objects (default: dry run)"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-copy even if the destination object already exists",
    )
    args = parser.parse_args()

    init_firebase()
    migrate(apply=args.apply, force=args.force)
