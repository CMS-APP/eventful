import { getApp } from "@react-native-firebase/app";
import appCheck from "@react-native-firebase/app-check";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";

export const FIREBASE_APP = getApp();
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

let appCheckInitialized = false;

onAuthStateChanged(FIREBASE_AUTH, async (user) => {
  if (!user) {
    return;
  }

  if (!appCheckInitialized) {
    const provider =
      appCheck(FIREBASE_APP).newReactNativeFirebaseAppCheckProvider();
    provider.configure({
      android: {
        provider: "playIntegrity"
      },
      apple: {
        provider: "deviceCheck"
      }
    });

    await appCheck(FIREBASE_APP).initializeAppCheck({
      provider,
      isTokenAutoRefreshEnabled: true
    });
    appCheckInitialized = true;
  }
});

export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
