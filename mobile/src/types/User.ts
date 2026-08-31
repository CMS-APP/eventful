import { FieldValue, Timestamp } from "@react-native-firebase/firestore";

export interface User {
  uid: string;
  email?: string;
  emailVerified: boolean;
  name: string;
  firstName?: string;
  lastName?: string;
  searchName?: string;
  username: string;
  usernameCreateDate?: Timestamp | number;
  usernameUpdateDate?: Timestamp | number;
  pushTokens: string[];
  platform?: string | number;
  version?: string | number;
  appVersion?: string | number;
  appBuildVersion?: string;
  osVersion?: string;
  deviceModel?: string;
  deviceType?: string;
  isPhysicalDevice?: boolean;
  region?: string;
  locale?: string;
  databaseUpdate?: string;
  lastLaunchedAt?: Timestamp | FieldValue;
  profilePictureHash?: string;
  spotifyData?: {
    spotifyAccessToken: string;
    spotifyExpirationDate: string;
  };
  appleOnboardingName?: {
    firstName: string;
    lastName: string;
  };
  googleOnboardingName?: {
    firstName: string;
  };
}
