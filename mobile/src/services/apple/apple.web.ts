/** @format */

// Web version - Apple Sign In is not available on web
export async function revokeSignInWithAppleToken() {
  throw new Error("Apple Sign In is not available on web platform");
}

export async function getAppleCredentialForReauthentication(): Promise<{
  identityToken: string;
  nonce: string | undefined;
}> {
  throw new Error("Apple Sign In is not available on web platform");
}
