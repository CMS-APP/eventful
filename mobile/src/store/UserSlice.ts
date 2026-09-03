import { Timestamp } from "@react-native-firebase/firestore";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react-native";

import { Platform } from "react-native";

import { User } from "../types/User";
import { log } from "../utils/logging";

/** Name from Sign in with Apple (only provided on first auth). Used to pre-fill onboarding so we don't ask for name again. */
interface AppleOnboardingName {
  firstName: string;
  lastName: string;
}

interface GoogleOnboardingName {
  name: string;
}

export interface UserState {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  uid: string;
  username: string;
  profilePictureHash: string;
  usernameCreateDate: Timestamp;
  usernameUpdateDate: Timestamp;
  spotify: {
    spotifyAccessToken: string;
    spotifyExpirationDate: string;
  };
  premium: boolean;
  photoBooth: boolean;
  photoBoothLocked: boolean;
  googleOnboardingName: GoogleOnboardingName | null;
  appleOnboardingName: AppleOnboardingName | null;
}

const sentryReduxMiddleware = (_store: any) => (next: any) => (action: any) => {
  try {
    Sentry.addBreadcrumb({
      category: "redux",
      message: `Action dispatched: ${action.type}`,
      level: "info"
    });
  } catch {
    // Silently handle Sentry breadcrumb errors to avoid breaking the app
    log("Error adding Sentry breadcrumb", "error");
  }

  return next(action);
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    name: "",
    firstName: "",
    lastName: "",
    email: "",
    uid: "",
    username: "",
    profilePictureHash: "",
    usernameCreateDate: null,
    usernameUpdateDate: null,
    spotify: null,
    premium: __DEV__,
    photoBooth: false,
    photoBoothLocked: false
  },
  reducers: {
    setUserData: (state, action) => {
      state.name = action.payload.name;
      state.firstName = action.payload.firstName ?? state.name;
      state.lastName = action.payload.lastName ?? "";
      state.email = action.payload.email;
      state.uid = action.payload.uid;
      state.username = action.payload.username;
      state.profilePictureHash = action.payload.profilePictureHash;
      state.usernameUpdateDate = action.payload.usernameUpdateDate;
      state.usernameCreateDate = action.payload.usernameCreateDate;
      state.spotify = action.payload.spotify;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setFirstName: (state, action) => {
      state.firstName = action.payload;
    },
    setLastName: (state, action) => {
      state.lastName = action.payload;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
    setProfilePictureHash: (state, action) => {
      state.profilePictureHash = action.payload;
    },
    setUsernameUpdateDate: (state, action) => {
      state.usernameUpdateDate = action.payload;
    },
    setSpotifyData: (state, action) => {
      state.spotify = action.payload;
    },
    clearSpotifyData: (state) => {
      state.spotify = null;
    },
    clearStorage: (state) => {
      state.name = "";
      state.firstName = "";
      state.lastName = "";
      state.email = "";
      state.uid = "";
      state.username = "";
      state.profilePictureHash = "";
      state.usernameUpdateDate = null;
      state.spotify = null;
      state.premium = __DEV__;
      state.photoBooth = false;
      state.photoBoothLocked = false;
    },
    setPremium: (state, action) => {
      state.premium = action.payload;
    },
    setPhotoBooth: (state, action) => {
      state.photoBooth = action.payload;
    },
    setPhotoBoothLocked: (state, action) => {
      state.photoBoothLocked = action.payload;
    }
  }
});

export const {
  setUserData,
  setName,
  setFirstName,
  setLastName,
  setUsername,
  setProfilePictureHash,
  setUsernameUpdateDate,
  clearStorage,
  setSpotifyData,
  clearSpotifyData,
  setPremium,
  setPhotoBooth,
  setPhotoBoothLocked
} = userSlice.actions;

export const userStore = configureStore({
  reducer: userSlice.reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sentryReduxMiddleware)
});

export function setUserInSentry(user: User) {
  const os = Platform?.OS ?? "unknown";
  const version = Platform?.Version ?? "1.0.0";

  const data = {
    id: user.uid,
    email: user.email,
    platform: os,
    version
  };

  Sentry.setUser(data);
}
