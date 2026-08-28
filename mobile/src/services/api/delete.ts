import { deleteDoc, doc } from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/app/init/firebase";

export async function deleteDocument(...pathSegments: string[]): Promise<void> {
  const docRef = doc(FIRESTORE_DB, ...pathSegments);
  await deleteDoc(docRef);
}
