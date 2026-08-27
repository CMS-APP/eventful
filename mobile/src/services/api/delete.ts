import { deleteDoc, doc } from "@react-native-firebase/firestore";

import { safeMutation } from "@/services/api/error";
import { log } from "@/utils/logging";

import { FIRESTORE_DB } from "../firebase/firebase";

export async function deleteDocument(...pathSegments: string[]): Promise<void> {
  log("Deleting document", "debug");
  log("Path segments: " + pathSegments, "debug");
  await safeMutation(async () => {
    const docRef = doc(FIRESTORE_DB, ...pathSegments);
    await deleteDoc(docRef);
  }, "Error deleting document");
}
