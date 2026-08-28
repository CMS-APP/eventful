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

import { removeAllData } from "@/services/local/async";
import { clearCache } from "@/services/local/cache";
import { clearNotifications } from "@/services/pushNotifications";
import { clearStorage } from "@/store/UserSlice";
import { log } from "@/utils/logging";

import { incrementUserCount } from "./backend";

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
    return userCredential.user;
  } catch {
    return null;
  }
}

export async function handleSignOut(dispatch: Dispatch<Action>) {
  const auth = getAuth();

  await clearNotifications();
  await removeAllData();
  await clearCache();

  dispatch(clearStorage());

  if (Platform.OS === "ios") {
    await setBadgeCountAsync(0);
  }

  try {
    await GoogleSignin.signOut();
  } catch (error) {
    log(`Error signing out from Google Sign-In: ${error}`, "error");
  }

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
    incrementUserCount(userCredential.user);
    return userCredential.user;
  } catch (error) {
    if ((error as { code: string }).code === "auth/email-already-in-use") {
      return "Email already in use.";
    }
    throw error;
  }
}
