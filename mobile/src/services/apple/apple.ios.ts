/** @format */
import { appleAuth } from "@invertase/react-native-apple-authentication";
import auth from "@react-native-firebase/auth";

export async function revokeSignInWithAppleToken() {
  const { authorizationCode } = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.REFRESH
  });

  if (!authorizationCode) {
    throw new Error("Apple Revocation failed - no authorizationCode returned");
  }

  return auth().revokeToken(authorizationCode);
}

export async function getAppleCredentialForReauthentication() {
  const response = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL]
  });

  if (!response.identityToken) {
    throw new Error("Apple Sign-In failed - no identity token returned");
  }

  return {
    identityToken: response.identityToken,
    nonce: response.nonce
  };
}
