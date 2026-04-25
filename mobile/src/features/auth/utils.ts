import { AppleRequestResponse } from "@invertase/react-native-apple-authentication";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

import { setDocumentMerge } from "@/services/api/update";

export async function saveAppleOnboardingName(
  user: FirebaseAuthTypes.User,
  fullName: AppleRequestResponse["fullName"]
) {
  await setDocumentMerge(
    {
      uid: user.uid,
      appleOnboardingName: {
        firstName: fullName?.givenName,
        lastName: fullName?.familyName
      }
    },
    "user",
    user.uid
  );
}

export async function saveGoogleOnboardingName(
  user: FirebaseAuthTypes.User,
  profile: Record<string, any>
) {
  await setDocumentMerge(
    {
      uid: user.uid,
      googleOnboardingName: {
        firstName: profile?.given_name,
        lastName: profile?.family_name || ""
      }
    },
    "user",
    user.uid
  );
}
