import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export type GalleryPhoto = {
  createdAt: FirebaseFirestoreTypes.Timestamp;
  eventTitle: string;
  photoId: string;
  url?: string;
  uri?: string;
  userId: string;
  type: "local" | "cloud" | "both";
};

export type GalleryEvent = {
  eventTitle: string;
  photos: GalleryPhoto[];
  date: FirebaseFirestoreTypes.Timestamp | string;
  type: "local" | "cloud" | "both";
};
