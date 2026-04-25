/** @format */

// Android version - Apple Sign In is not available on Android
export async function revokeSignInWithAppleToken() {
  throw new Error("Apple Sign In is not available on Android platform");
}

export async function getAppleCredentialForReauthentication(): Promise<{
  identityToken: string;
  nonce: string | undefined;
}> {
  throw new Error("Apple Sign In is not available on Android platform");
}
