from firebase_admin import initialize_app

from src.functions.firestore_handlers import (
    inviteWritten,
    notificationWritten,
    sendFeedbackEmail,
    syncFollowers,
    syncFollowing,
)
from src.functions.http_handlers import (
    analyticsFeatureUsage,
    analyticsFunnel,
    analyticsRealtimeUsers,
    forgotPassword,
    galleryInfo,
    locationSearch,
    respondToEvent,
    searchUsers,
    sendVerificationEmail,
    subscriptionStats,
)
from src.functions.scheduled_handlers import snapshotActiveUsers, snapshotTotalUsers

initialize_app()
