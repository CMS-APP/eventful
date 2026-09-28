import { FIREBASE_AUTH } from "@/app/init/firebase";
import { updateUserInfo } from "@/services/firebase/user";
import { User } from "@/types/User";

function resolveAuthProvider(
  providerData: { providerId: string }[]
): User["authProvider"] {
  const federated = providerData.find(
    (provider) =>
      provider.providerId === "google.com" ||
      provider.providerId === "apple.com"
  );
  return (federated?.providerId as User["authProvider"]) ?? "password";
}

export async function backfillAuthProvider(userId: string) {
  const currentUser = FIREBASE_AUTH.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    return;
  }

  const authProvider = resolveAuthProvider(currentUser.providerData);
  await updateUserInfo(userId, { authProvider });
}
