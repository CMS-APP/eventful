import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { config as socialAuthConfig } from "@/config/socialAuth";

let initialized = false;

export function initializeGoogleSignin(): void {
  if (initialized) {
    return;
  }

  GoogleSignin.configure({
    webClientId: socialAuthConfig.google.webClientId,
    iosClientId: socialAuthConfig.google.iosClientId
  });

  initialized = true;
}
