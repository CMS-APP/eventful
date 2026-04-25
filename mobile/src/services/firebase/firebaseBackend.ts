import { FirebaseAuthTypes, getIdToken } from "@react-native-firebase/auth";

import { AppError } from "@/utils/error";

async function getAppCheckToken(user: FirebaseAuthTypes.User) {
  const idToken = await getIdToken(user, true);
  const appCheckRes = await fetch(
    "https://appchecktoken-iuxeocrkta-uc.a.run.app",
    {
      headers: {
        Authorization: `Bearer ${idToken}`
      }
    }
  );
  const { token: appCheckToken } = await appCheckRes.json();
  return appCheckToken;
}

export async function sendVerificationEmail(user: FirebaseAuthTypes.User) {
  try {
    const appCheckToken = await getAppCheckToken(user);

    const verificationRes = await fetch(
      "https://sendverificationemail-iuxeocrkta-uc.a.run.app",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Firebase-AppCheck": appCheckToken
        },
        body: JSON.stringify({ email: user.email })
      }
    );
    return verificationRes;
  } catch (error) {
    throw new AppError(
      error,
      "FirebaseBackend: Error sending verification email"
    );
  }
}

export async function incrementUserCount(user: FirebaseAuthTypes.User) {
  try {
    const appCheckToken = await getAppCheckToken(user);

    const response = await fetch(
      `https://incrementusercount-iuxeocrkta-uc.a.run.app`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Firebase-AppCheck": appCheckToken
        }
      }
    );

    if (!response.ok) {
      throw new AppError(
        response,
        "FirebaseBackend: Error incrementing user count"
      );
    }
  } catch (error) {
    throw new AppError(error, "FirebaseBackend: Error incrementing user count");
  }
}

export async function incrementEventCount(user: FirebaseAuthTypes.User) {
  try {
    const appCheckToken = await getAppCheckToken(user);

    // Step 3: Call the Firebase Cloud Function
    const response = await fetch(
      `https://incrementeventcount-iuxeocrkta-uc.a.run.app`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Firebase-AppCheck": appCheckToken
        }
      }
    );

    if (!response.ok) {
      throw new AppError(
        response,
        "FirebaseBackend: Error incrementing event count"
      );
    }
  } catch (error) {
    throw new AppError(
      error,
      "FirebaseBackend: Error incrementing event count"
    );
  }
}

export async function userSearch(
  searchInput: string,
  user: FirebaseAuthTypes.User
) {
  try {
    const appCheckToken = await getAppCheckToken(user);

    const response = await fetch(
      `https://searchusers-iuxeocrkta-uc.a.run.app`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Firebase-AppCheck": appCheckToken
        },
        body: JSON.stringify({ q: searchInput }) // must match function
      }
    );

    const { hits } = await response.json(); // function returns hits
    return hits;
  } catch (error) {
    throw new AppError(error, "FirebaseBackend: Error searching for users");
  }
}
