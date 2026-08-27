import { GoogleSignin } from "@react-native-google-signin/google-signin";

let initialized = false;

export const config = {
  google: {
    webClientId:
      "165003650822-4q0g9qgjuhr2rt5747s1hnk0n9d03v41.apps.googleusercontent.com"
  }
};

export function googleInit(): void {
  if (initialized) {
    return;
  }

  GoogleSignin.configure({
    webClientId: config.google.webClientId
  });

  initialized = true;
}
