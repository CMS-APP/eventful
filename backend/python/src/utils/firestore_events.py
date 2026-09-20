def event_before_after(event) -> tuple[dict | None, dict | None]:
    before = event.data.before.to_dict() if event.data.before else None
    after = event.data.after.to_dict() if event.data.after else None
    return before, after
