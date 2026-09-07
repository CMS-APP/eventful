const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2/options");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

setGlobalOptions({ region: "europe-west2" });

admin.initializeApp();

exports.appCheckToken = onRequest((request, response) => {
  cors(request, response, async () => {
    const idToken = request.headers.authorization?.split("Bearer ")[1];

    if (!idToken) {
      console.log("No ID token found in request");
      return response.status(400).send("No ID token found");
    }

    console.log("Received ID token:", idToken);

    try {
      const validToken = await admin.auth().verifyIdToken(idToken);
      console.log("Verified token:", validToken);

      if (!validToken) {
        console.log("Invalid token");
        return response.status(401).send("Unauthorized");
      }

      const appCheckToken = await admin.appCheck().createToken("1:165003650822:web:88a7fa08ae63985891a087");

      response.json({ token: appCheckToken.token });
    } catch (err) {
      console.error("Error verifying token:", err);
      response.status(401).send("Unauthorized");
    }
  });
});
