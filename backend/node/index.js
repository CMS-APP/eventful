const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const admin = require("firebase-admin");
const {
  createAppCheckTokenHandler
} = require("./src/functions/httpHandlers");

setGlobalOptions({ region: "europe-west2" });

admin.initializeApp();

exports.appCheckToken = onRequest(createAppCheckTokenHandler({ admin }));
