import { getApp } from "@react-native-firebase/app";
import appCheck from "@react-native-firebase/app-check";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";

export const FIREBASE_APP = getApp();
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

const check = appCheck(FIREBASE_APP).newReactNativeFirebaseAppCheckProvider();
check.configure({
  android: {
    provider: "playIntegrity"
  },
  apple: {
    provider: "deviceCheck"
  }
});

appCheck(FIREBASE_APP).initializeAppCheck({
  provider: check,
  isTokenAutoRefreshEnabled: true
});

export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
