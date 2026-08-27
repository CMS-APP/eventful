import {
  addDoc,
  collection,
  doc,
  setDoc
} from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/services/firebase/firebase";

export async function createDocument(
  data: any,
  ...pathSegments: string[]
): Promise<string> {
  if (pathSegments.length % 2 === 1) {
    const docRef = await addDoc(
      collection(FIRESTORE_DB, ...(pathSegments as [string, ...string[]])),
      data
    );
    return docRef.id;
  } else {
    const docRef = doc(
      FIRESTORE_DB,
      ...(pathSegments as [string, ...string[]])
    );
    await setDoc(docRef, data);
    return docRef.id;
  }
}
