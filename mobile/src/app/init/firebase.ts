import { getApp } from "@react-native-firebase/app";
import appCheck, { getToken } from "@react-native-firebase/app-check";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";

export const FIREBASE_APP = getApp();
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

const DEBUG_APP_CHECK_TOKEN = "5230693B-A78D-4BD8-AC3C-79A10F20408B";

const appCheckInstance = appCheck(FIREBASE_APP);
const appCheckProvider =
  appCheckInstance.newReactNativeFirebaseAppCheckProvider();

appCheckProvider.configure({
  android: {
    provider: __DEV__ ? "debug" : "playIntegrity",
    debugToken: __DEV__ ? DEBUG_APP_CHECK_TOKEN : undefined
  },
  apple: {
    provider: __DEV__ ? "debug" : "appAttestWithDeviceCheckFallback",
    debugToken: __DEV__ ? DEBUG_APP_CHECK_TOKEN : undefined
  }
});

const appCheckReady = appCheckInstance.initializeAppCheck({
  provider: appCheckProvider,
  isTokenAutoRefreshEnabled: true
});

export async function getAppCheckToken(): Promise<string> {
  await appCheckReady;
  const result = await getToken(appCheckInstance);
  return result.token;
}

export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
