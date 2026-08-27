import { doc, setDoc, updateDoc } from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "../firebase/firebase";

export async function updateDocument(
  data: any,
  ...pathSegments: string[]
): Promise<void> {
  await updateDoc(
    doc(FIRESTORE_DB, ...(pathSegments as [string, ...string[]])),
    data
  );
}

export async function setDocument(
  data: any,
  ...pathSegments: string[]
): Promise<void> {
  await setDoc(
    doc(FIRESTORE_DB, ...(pathSegments as [string, ...string[]])),
    data
  );
}

export async function setDocumentMerge(
  data: any,
  ...pathSegments: string[]
): Promise<void> {
  await setDoc(
    doc(FIRESTORE_DB, ...(pathSegments as [string, ...string[]])),
    data,
    { merge: true }
  );
}
