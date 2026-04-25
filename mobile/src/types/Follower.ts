import { Timestamp } from "@react-native-firebase/firestore";

export interface Follower {
  followerId: string | null;
  followingId: string | null;
  status: string;
  followedAt: Timestamp;
  unfollowedAt: Timestamp | null;
}
