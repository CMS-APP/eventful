import {
  addDoc,
  collection,
  doc,
  setDoc
} from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/services/firebase/firebase";
import { safeMutation } from "@/services/api/error";
import { log } from "@/utils/logging";

export async function createDocument(
  data: any,
  ...pathSegments: string[]
): Promise<string> {
  log("Creating document", "info");
  log("Path segments: " + pathSegments.join("/"), "debug");
  return safeMutation(async () => {
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
  }, "Error creating document");
}
