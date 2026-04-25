export async function getUserInfo(admin, uid) {
  try {
    const docRef = admin.firestore().collection("user").doc(uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      console.debug("FirebaseFunctions: User Details Found");
      return docSnap.data();
    } else {
      console.debug("FirebaseFunctions: User Details Not Found");
      return null;
    }
  } catch (error) {
    if (error.code === "permission-denied") {
      console.warn(
        "FirebaseFunctions: Current User does not have user account",
      );
      return null;
    } else {
      console.error("FirebaseFunctions: Error getting user details:", error);
      throw error;
    }
  }
}
