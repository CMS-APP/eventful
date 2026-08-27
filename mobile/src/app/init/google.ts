import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { config as socialAuthConfig } from "@/config/socialAuth";

let initialized = false;

export function googleInit(): void {
  if (initialized) {
    return;
  }

  GoogleSignin.configure({
    webClientId: socialAuthConfig.google.webClientId
  });

  initialized = true;
}
