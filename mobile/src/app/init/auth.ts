import {
  FirebaseAuthTypes,
  onAuthStateChanged
} from "@react-native-firebase/auth";

import { FIREBASE_AUTH } from "@/app/init/firebase";

export function checkAuth(): Promise<FirebaseAuthTypes.User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      unsubscribe();

      if (user) {
        resolve(user);
      } else {
        resolve(null);
      }
    });
  });
}
