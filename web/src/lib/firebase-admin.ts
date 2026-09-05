import * as admin from "firebase-admin";

export interface ServiceAccountCredentials {
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
}

export function getServiceAccountCredentials():
  | ServiceAccountCredentials
  | undefined {
  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!key) return undefined;
  try {
    const parsed = JSON.parse(key) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (parsed.private_key) {
      return {
        projectId: parsed.project_id,
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key.replace(/\\n/g, "\n")
      };
    }
  } catch {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_KEY");
  }
  return undefined;
}

function getFirebaseAdminCredential(): admin.credential.Credential | undefined {
  const credentials = getServiceAccountCredentials();
  if (!credentials?.privateKey) return undefined;
  return admin.credential.cert({
    projectId: credentials.projectId,
    clientEmail: credentials.clientEmail,
    privateKey: credentials.privateKey
  });
}

function getFirebaseAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  const credential = getFirebaseAdminCredential();
  const projectId = "eventful-23690";
  if (!credential) {
    throw new Error(
      "Firebase Admin: Set FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }
  return admin.initializeApp({
    credential,
    projectId
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
