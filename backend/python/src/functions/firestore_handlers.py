from firebase_functions import firestore_fn

from src.config import MJ_API_KEY, MJ_SECRET
from src.services.feedback import handle_send_feedback_email
from src.services.followers import handle_sync_followers, handle_sync_following
from src.services.notifications import handle_invite_written, handle_notification_written


@firestore_fn.on_document_written(document="followers/{userId}/followers/{followerId}")
def syncFollowing(event):
    handle_sync_following(event)


@firestore_fn.on_document_written(document="following/{userA}/following/{userB}")
def syncFollowers(event):
    handle_sync_followers(event)


@firestore_fn.on_document_written(document="notifications/{notificationId}")
def notificationWritten(event):
    handle_notification_written(event)


@firestore_fn.on_document_written(document="invite/{inviteId}")
def inviteWritten(event):
    handle_invite_written(event)


@firestore_fn.on_document_written(document="feedback/{feedbackId}", secrets=[MJ_API_KEY, MJ_SECRET])
def sendFeedbackEmail(event):
    handle_send_feedback_email(event, MJ_API_KEY, MJ_SECRET)
