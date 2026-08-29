import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type GalleryPhoto = {
  createdAt: FirebaseFirestoreTypes.Timestamp;
  eventTitle: string;
  photoId: string;
  storageId?: string;
  url?: string;
  uri?: string;
  userId: string;
  type: "local" | "cloud" | "both";
  width?: number;
  height?: number;
};

export type GalleryEvent = {
  eventTitle: string;
  photos: GalleryPhoto[];
  date: FirebaseFirestoreTypes.Timestamp | string;
  type: "local" | "cloud" | "both";
};
