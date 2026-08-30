/** @format */
import { appleAuth } from "@invertase/react-native-apple-authentication";
import auth from "@react-native-firebase/auth";

import { Platform } from "react-native";

import { log } from "@/utils/logging";

export async function revokeSignInWithAppleToken(authorizationCode: string) {
  try {
    if (Platform.OS !== "ios") {
      throw new Error("Apple Sign In is not available on this platform");
    }

    await auth().revokeToken(authorizationCode);
  } catch (error) {
    log(`Error revoking Apple token: ${error}`, "error");
    throw error;
  }
}

export async function getAppleCredentialForReauthentication() {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Sign In is not available on this platform");
  }

  const response = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL]
  });

  if (!response.identityToken) {
    throw new Error("Apple Sign-In failed - no identity token returned");
  }

  return {
    identityToken: response.identityToken,
    nonce: response.nonce,
    authorizationCode: response.authorizationCode
  };
}
