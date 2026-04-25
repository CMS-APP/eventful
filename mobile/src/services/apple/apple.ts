// Platform-specific implementations
// React Native Metro bundler will automatically resolve to the correct platform file
// This file provides TypeScript with the type definitions

export async function revokeSignInWithAppleToken(): Promise<void> {
  // This is a type-only export - actual implementation is in platform-specific files
  throw new Error("Platform-specific implementation required");
}

export async function getAppleCredentialForReauthentication(): Promise<{
  identityToken: string;
  nonce: string | undefined;
}> {
  throw new Error("Platform-specific implementation required");
}
