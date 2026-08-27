const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { getStoragePathFromUrl } = require("./src/services/photos");
const {
  createAlgoliaUserSearchHandler
} = require("./src/services/algoliaUserSearch");
const {
  createRespondToEventHandler,
  createAppCheckTokenHandler,
  createSendVerificationEmailHandler,
  createForgotPasswordHandler,
  createIncrementStatHandler,
  createSignUpHandler
} = require("./src/functions/httpHandlers");
const {
  createSyncFollowersHandler,
  createSendFeedbackEmailHandler
} = require("./src/functions/firestoreHandlers");
const {
  createDeleteOldPhotosHandler
} = require("./src/functions/scheduledHandlers");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const RECAPTCHA_SECRET = defineSecret("RECAPTCHA_SECRET");
const MJ_API_KEY = defineSecret("MJ_API_KEY");
const MJ_SECRET = defineSecret("MJ_SECRET");
const ALGOLIA_APP_ID = defineSecret("ALGOLIA_APP_ID");
const ALGOLIA_API_KEY = defineSecret("ALGOLIA_API_KEY");

exports.respondToEvent = onRequest(
  {
    secrets: [RECAPTCHA_SECRET],
    cors: [/eventfulapp\.com$/]
  },
  createRespondToEventHandler({ admin, db, RECAPTCHA_SECRET })
);

exports.appCheckToken = onRequest(createAppCheckTokenHandler({ admin }));

exports.sendVerificationEmail = onRequest(
  { secrets: [MJ_API_KEY, MJ_SECRET], minInstances: 1 },
  createSendVerificationEmailHandler({
    admin,
    MJ_API_KEY,
    MJ_SECRET
  })
);

exports.forgotPassword = onRequest(
  {
    secrets: [RECAPTCHA_SECRET, MJ_API_KEY, MJ_SECRET],
    cors: [/eventfulapp\.com$/]
  },
  createForgotPasswordHandler({
    admin,
    RECAPTCHA_SECRET,
    MJ_API_KEY,
    MJ_SECRET
  })
);

exports.signUp = onRequest(
  {
    secrets: [MJ_API_KEY, MJ_SECRET],
    cors: [/eventfulapp\.com$/, "http://localhost:3000"]
  },
  createSignUpHandler({ admin, MJ_API_KEY, MJ_SECRET })
);

exports.incrementUserCount = onRequest(
  createIncrementStatHandler({
    admin,
    db,
    fieldName: "userCount",
    successMessage: "User count incremented",
    failureMessage: "Error incrementing user count"
  })
);

exports.incrementEventCount = onRequest(
  createIncrementStatHandler({
    admin,
    db,
    fieldName: "eventCount",
    successMessage: "Event count incremented",
    failureMessage: "Error incrementing event count"
  })
);

exports.searchUsers = onRequest(
  {
    secrets: [ALGOLIA_APP_ID, ALGOLIA_API_KEY],
    cors: [/eventfulapp\.com$/],
    minInstances: 1
  },
  createAlgoliaUserSearchHandler({ admin, ALGOLIA_APP_ID, ALGOLIA_API_KEY })
);

exports.syncFollowers = onDocumentWritten(
  {
    document: "following/{userA}/following/{userB}",
    region: "europe-west2"
  },
  createSyncFollowersHandler({ admin, db })
);

exports.deleteOldPhotos = onSchedule(
  "every 24 hours",
  createDeleteOldPhotosHandler({ admin, db, storage, getStoragePathFromUrl })
);

exports.sendFeedbackEmail = onDocumentWritten(
  {
    document: "feedback/{feedbackId}",
    region: "europe-west2",
    secrets: [MJ_API_KEY, MJ_SECRET]
  },
  createSendFeedbackEmailHandler({ admin, MJ_API_KEY, MJ_SECRET })
);
