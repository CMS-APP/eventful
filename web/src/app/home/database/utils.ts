import { FIREBASE_AUTH, FIRESTORE_DB } from "@/app/Firebase";
import {
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export async function getUserData(user: User) {
  try {
    console.log("getUserData: Getting user data for user: " + user.uid);
    const userDoc = doc(FIRESTORE_DB, "user", user.uid);
    const userSnap = await getDoc(userDoc);
    return userSnap?.data() ?? null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

export async function deleteUserAccount(user: User, password: string) {
  try {
    await signInWithEmailAndPassword(FIREBASE_AUTH, user.email ?? "", password);
    await deleteUser(user);
  } catch (error) {
    throw new Error("Error deleting user data: " + error);
  }
}

export async function signOutUser() {
  try {
    await signOut(FIREBASE_AUTH);
  } catch (error) {
    throw new Error("Error signing out user account: " + error);
  }
}

export async function checkAdmin(userId: string) {
  try {
    const adminRef = doc(FIRESTORE_DB, "admin", "admin");
    const docSnap = await getDoc(adminRef);

    if (docSnap.exists()) {
      const admins = docSnap.data()?.uids || [];
      return admins.includes(userId);
    } else {
      console.warn("FirebaseFunctions: Admin document does not exist");
      return false;
    }
  } catch (error) {
    console.error("Error checking admin:", error);
    return false;
  }
}
