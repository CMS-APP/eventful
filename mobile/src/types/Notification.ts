import { Timestamp } from "@react-native-firebase/firestore";

export interface Notification {
  id: string;
  body: string;
  eventId: string;
  read: boolean;
  senderId: string;
  subType: string;
  timestamp: Timestamp;
  title: string;
  userId: string;
}
