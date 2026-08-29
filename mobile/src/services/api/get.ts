import {
  FirebaseFirestoreTypes,
  collection,
  doc,
  getDoc,
  getDocs,
  query
} from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/app/init/firebase";

type DocumentData = FirebaseFirestoreTypes.DocumentData | undefined;
type QueryDocumentSnapshot = FirebaseFirestoreTypes.QueryDocumentSnapshot;

type QueryConstraintType =
  Parameters<typeof query> extends [any, ...infer Rest] ? Rest[number] : never;

export async function getDocument(
  ...pathSegments: string[]
): Promise<DocumentData> {
  const docRef = doc(FIRESTORE_DB, ...(pathSegments as [string, ...string[]]));
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return undefined;
  }
  const data = docSnap.data();
  return data ? ({ ...data, id: docSnap.id } as DocumentData) : undefined;
}

export async function getDocuments(
  ...pathSegments: string[]
): Promise<DocumentData[]> {
  const docsRef = collection(
    FIRESTORE_DB,
    ...(pathSegments as [string, ...string[]])
  );
  const docsSnap = await getDocs(docsRef);
  return docsSnap.docs.map((doc: QueryDocumentSnapshot) => ({
    ...doc.data(),
    id: doc.id
  }));
}

export async function getDocumentsByQuery(
  queryConstraints: QueryConstraintType[],
  ...pathSegments: string[]
): Promise<DocumentData[]> {
  const docsRef = collection(
    FIRESTORE_DB,
    ...(pathSegments as [string, ...string[]])
  );
  const docsSnap = await getDocs(query(docsRef, ...(queryConstraints as any)));
  return docsSnap.docs.map((doc: QueryDocumentSnapshot) => ({
    ...doc.data(),
    id: doc.id
  }));
}
