import {
  FirebaseAuthTypes,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Action, Dispatch } from "@reduxjs/toolkit";

import { Platform } from "react-native";

import { setBadgeCountAsync } from "expo-notifications";

import {
  trackAuthSignIn,
  trackAuthSignOut,
  trackAuthSignUp
} from "@/services/analytics/events";
import { removeAllData } from "@/services/local/async";
import { clearCache } from "@/services/local/cache";
import { clearNotifications } from "@/services/pushNotifications";
import { clearStorage } from "@/store/UserSlice";
import { log } from "@/utils/logging";

import { setAnalyticsUserId } from "../analytics/analytics";
import { removeExpoToken } from "./user";

export async function handleSignIn(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User | null> {
  try {
    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    trackAuthSignIn();
    return userCredential.user;
  } catch {
    return null;
  }
}

export async function handleSignOut(dispatch: Dispatch<Action>) {
  const auth = getAuth();

  await clearCache();
  await clearNotifications();
  await removeExpoToken(auth.currentUser?.uid || "");
  await removeAllData();

  dispatch(clearStorage());

  if (Platform.OS === "ios") {
    await setBadgeCountAsync(0);
  }

  try {
    await GoogleSignin.signOut();
  } catch (error) {
    log(`Error signing out from Google Sign-In: ${error}`, "error");
  }

  trackAuthSignOut();
  setAnalyticsUserId(null);
  await signOut(auth);
}

export async function handleSignUp(
  email: string,
  password: string
): Promise<FirebaseAuthTypes.User | string> {
  try {
    const auth = getAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    trackAuthSignUp();
    return userCredential.user;
  } catch (error) {
    if ((error as { code: string }).code === "auth/email-already-in-use") {
      return "Email already in use.";
    }
    throw error;
  }
}
