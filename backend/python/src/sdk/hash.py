import hashlib
import re


def event_hash(event_title: str) -> str:
    clean_title = re.sub(r"\s+", "-", re.sub(r"[^a-z0-9\s]", "", event_title.strip().lower()))
    return hashlib.sha256(clean_title.encode("utf-8")).hexdigest()[:16]
