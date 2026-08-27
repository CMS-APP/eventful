import { FIREBASE_AUTH } from "@/services/firebase/firebase";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { log } from "@/utils/logging";

export async function getLoginNames() {
  const user = FIREBASE_AUTH.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  log("Getting user details", "info");
  const userDetails = await getUserInfo(user?.uid);
  if (userDetails?.appleOnboardingName) {
    log("Apple onboarding name found for user " + user?.uid, "info");
    const appleOnboardingName = userDetails?.appleOnboardingName;
    return {
      type: "apple",
      firstName: appleOnboardingName?.firstName,
      lastName: appleOnboardingName?.lastName
    };
  }
  if (userDetails?.googleOnboardingName) {
    log("Google onboarding name found for user " + user?.uid, "info");
    const googleOnboardingName = userDetails?.googleOnboardingName;
    return {
      type: "google",
      firstName: googleOnboardingName?.firstName
    };
  }
  return null;
}
