import { FirebaseAuthTypes, getIdToken } from "@react-native-firebase/auth";

import { AppError } from "@/utils/error";

const BASE_URL = "https://api.eventfulapp.com";

const ENDPOINTS = {
  appCheckToken: `${BASE_URL}/appCheckToken`,
  sendVerificationEmail: `${BASE_URL}/sendVerificationEmail`,
  incrementUserCount: `${BASE_URL}/incrementUserCount`,
  incrementEventCount: `${BASE_URL}/incrementEventCount`,
  userSearch: `${BASE_URL}/searchUsers`
};

async function getAppCheckToken(user: FirebaseAuthTypes.User) {
  const idToken = await getIdToken(user, true);
  const appCheckRes = await fetch(ENDPOINTS.appCheckToken, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  if (!appCheckRes.ok) {
    const msg = "FirebaseBackend: Error getting App Check token";
    throw new AppError(appCheckRes, msg);
  }

  const { token: appCheckToken } = await appCheckRes.json();
  return appCheckToken;
}

async function post(
  user: FirebaseAuthTypes.User,
  endpoint: string,
  body?: Record<string, unknown>,
  { throwOnError = true }: { throwOnError?: boolean } = {}
) {
  const appCheckToken = await getAppCheckToken(user);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Firebase-AppCheck": appCheckToken
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (throwOnError && !response.ok) {
    const msg = `FirebaseBackend: Request failed (${response.status})`;
    throw new AppError(response, msg);
  }

  return response;
}

export async function sendVerificationEmail(user: FirebaseAuthTypes.User) {
  try {
    return await post(
      user,
      ENDPOINTS.sendVerificationEmail,
      { email: user.email },
      { throwOnError: false }
    );
  } catch (error) {
    const msg = "FirebaseBackend: Error sending verification email";
    throw new AppError(error, msg);
  }
}

export async function incrementUserCount(user: FirebaseAuthTypes.User) {
  try {
    await post(user, ENDPOINTS.incrementUserCount);
  } catch (error) {
    throw new AppError(error, "FirebaseBackend: Error incrementing user count");
  }
}

export async function incrementEventCount(user: FirebaseAuthTypes.User) {
  try {
    await post(user, ENDPOINTS.incrementEventCount);
  } catch (error) {
    const msg = "FirebaseBackend: Error incrementing event count";
    throw new AppError(error, msg);
  }
}

export async function userSearch(
  searchInput: string,
  user: FirebaseAuthTypes.User
) {
  try {
    const response = await post(user, ENDPOINTS.userSearch, { q: searchInput });
    const { hits } = await response.json();
    return hits;
  } catch (error) {
    throw new AppError(error, "FirebaseBackend: Error searching for users");
  }
}
