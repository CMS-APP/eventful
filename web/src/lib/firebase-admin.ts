import * as admin from "firebase-admin";

function getFirebaseAdminCredential(): admin.credential.Credential | undefined {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) return undefined;
  try {
    const parsed = JSON.parse(key) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (parsed.private_key) {
      const privateKey = parsed.private_key.replace(/\\n/g, "\n");
      return admin.credential.cert({
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey,
      });
    }
  } catch {
    // ignore parse error
  }
  return undefined;
}

function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  const credential = getFirebaseAdminCredential();
  const projectId = "eventful-23690";
  if (!credential) {
    throw new Error(
      "Firebase Admin: Set FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY",
    );
  }
  return admin.initializeApp({
    credential,
    projectId,
  });
}

export function getAdminFirestore(): admin.firestore.Firestore {
  getFirebaseAdminApp();
  return admin.firestore();
}

export function getAdminAuth(): admin.auth.Auth {
  getFirebaseAdminApp();
  return admin.auth();
}
