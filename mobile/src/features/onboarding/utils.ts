import { FIREBASE_AUTH } from "@/app/init/firebase";
import { getUserInfo } from "@/services/firebase/user";

export async function getLoginNames() {
  const user = FIREBASE_AUTH.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  const userDetails = await getUserInfo(user?.uid);
  if (userDetails?.appleOnboardingName) {
    const appleOnboardingName = userDetails?.appleOnboardingName;
    return {
      type: "apple",
      firstName: appleOnboardingName?.firstName,
      lastName: appleOnboardingName?.lastName
    };
  }
  if (userDetails?.googleOnboardingName) {
    const googleOnboardingName = userDetails?.googleOnboardingName;
    return {
      type: "google",
      firstName: googleOnboardingName?.firstName
    };
  }
  const [firstName, ...lastNames] = (user.displayName ?? "")
    .trim()
    .split(/\s+/);
  if (firstName) {
    return {
      type: "email",
      firstName,
      lastName: lastNames.join(" ")
    };
  }
  return null;
}
