import requests

DEFAULT_TIMEOUT = 10


def get(url, **kwargs):
    kwargs.setdefault("timeout", DEFAULT_TIMEOUT)
    return requests.get(url, **kwargs)


def post(url, **kwargs):
    kwargs.setdefault("timeout", DEFAULT_TIMEOUT)
    return requests.post(url, **kwargs)
