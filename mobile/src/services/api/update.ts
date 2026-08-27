import { doc, setDoc, updateDoc } from "@react-native-firebase/firestore";

import { safeMutation } from "@/services/api/error";
import { log } from "@/utils/logging";

import { FIRESTORE_DB } from "../firebase/firebase";

export async function updateDocument(
  data: any,
  ...pathSegments: string[]
): Promise<void> {
  log("Updating document", "info");
  log("Path segments: " + pathSegments.join("/"), "debug");
  await safeMutation(async () => {
    await updateDoc(
      doc(FIRESTORE_DB, ...(pathSegments as [string, ...string[]])),
      data
    );
  }, "Error updating document");
}

export async function setDocument(
  data: any,
  ...pathSegments: string[]
): Promise<void> {
  log("Setting document", "debug");
  log("Path segments: " + pathSegments.join("/"), "debug");
  await safeMutation(async () => {
    await setDoc(
      doc(FIRESTORE_DB, ...(pathSegments as [string, ...string[]])),
      data
    );
  }, "Error setting document");
}

export async function setDocumentMerge(
  data: any,
  ...pathSegments: string[]
): Promise<void> {
  log("Setting document merge", "info");
  log("Path segments: " + pathSegments.join("/"), "debug");
  await safeMutation(async () => {
    await setDoc(
      doc(FIRESTORE_DB, ...(pathSegments as [string, ...string[]])),
      data,
      { merge: true }
    );
  }, "Error setting document merge");
}
