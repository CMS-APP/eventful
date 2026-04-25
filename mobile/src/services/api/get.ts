import {
  FirebaseFirestoreTypes,
  collection,
  doc,
  getDoc,
  getDocs,
  query
} from "@react-native-firebase/firestore";

import { FIRESTORE_DB } from "@/services/firebase/firebase";
import { safeQuery } from "@/utils/errorHandling";
import { log } from "@/utils/logging";

type DocumentData = FirebaseFirestoreTypes.DocumentData | undefined;
type QueryDocumentSnapshot = FirebaseFirestoreTypes.QueryDocumentSnapshot;

type QueryConstraintType =
  Parameters<typeof query> extends [any, ...infer Rest] ? Rest[number] : never;

export async function getDocument(
  ...pathSegments: string[]
): Promise<DocumentData> {
  log("Getting document", "debug");
  log("Path segments: " + pathSegments, "debug");
  return safeQuery(
    async () => {
      const docRef = doc(FIRESTORE_DB, ...pathSegments);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        return undefined;
      }
      const data = docSnap.data();
      return data ? ({ ...data, id: docSnap.id } as DocumentData) : undefined;
    },
    "Error getting document",
    undefined
  );
}

export async function getDocuments(
  ...pathSegments: string[]
): Promise<DocumentData[]> {
  log("Getting documents", "debug");
  log("Path segments: " + pathSegments, "debug");
  return safeQuery(
    async () => {
      const docsRef = collection(
        FIRESTORE_DB,
        ...(pathSegments as [string, ...string[]])
      );
      const docsSnap = await getDocs(docsRef);
      return docsSnap.docs.map((doc: QueryDocumentSnapshot) => ({
        ...doc.data(),
        id: doc.id
      }));
    },
    "Error getting documents",
    []
  );
}

export async function getDocumentsByQuery(
  queryConstraints: QueryConstraintType[],
  ...pathSegments: string[]
): Promise<DocumentData[]> {
  log("Getting documents by query", "debug");
  log("Query constraints: " + JSON.stringify(queryConstraints), "debug");
  log("Path segments: " + pathSegments, "debug");
  return safeQuery(
    async () => {
      const docsRef = collection(
        FIRESTORE_DB,
        ...(pathSegments as [string, ...string[]])
      );
      const docsSnap = await getDocs(
        query(docsRef, ...(queryConstraints as any))
      );
      return docsSnap.docs.map((doc: QueryDocumentSnapshot) => ({
        ...doc.data(),
        id: doc.id
      }));
    },
    "Error getting documents by query: " + JSON.stringify(queryConstraints),
    []
  );
}
