import { createNavigationContainerRef } from "@react-navigation/native";

import { Event } from "@/types/Event";
import { InAppNotification } from "@/types/InAppNotification";
import { Invite } from "@/types/Invite";
import { Invites } from "@/types/Invites";
import { Photo } from "@/types/Photo";
import { User } from "@/types/User";
import { UserInvite } from "@/types/UserInvite";

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

export type AppStackParamList = {
  LoadingScreen: undefined;
  Auth: undefined;
  Main:
    | { screen: string; params: { screen: string; params: { event: Event } } }
    | {
        screen: string;
        params: { screen: string; params: { user: User; type: string } };
      }
    | {
        screen: string;
        params: {
          screen: string;
          params: { invite: Invite; event: Event; host: User };
        };
      }
    | {
        screen: string;
        params: {
          screen: string;
          params: { screen: string; params: { user: User } };
        };
      }
    | {
        screen: string;
        params: {
          screen: string;
          params: { invite: Invite; event: Event };
        };
      }
    | undefined;
  Onboarding: undefined;
  Paywall: {
    type?: string;
  };
  WebView: { title: string; uri: string };
  EventInvite: { invite: Invite; event: Event; host: User };
  PhotoBooth: undefined;
  Celebration: {
    type: string;
  };
  Update: undefined;
};

export type AccountStackParamList = {
  AccountView: undefined;
  AccountPictureCamera: undefined;
  Profile:
    | { user: User }
    | { screen: string; params: { type: string; user: { uid: string } } };
  Settings: undefined;
};

export type AuthStackParamList = {
  SignIn: { email?: string; password?: string };
  SignUp: undefined;
  ForgotPassword: { title: string; uri: string };
  Welcome: undefined;
};

export type CalendarStackParamList = {
  CalendarView: undefined;
  Account: undefined;
};

export type ContactsStackParamList = {
  ContactsHome: undefined;
  ContactsInvitations: { invites: Invites } | undefined;
  ContactSearch: { open: boolean };
  Profile: {
    screen: "ProfileView";
    params: {
      user: User;
    };
  };
  Account: undefined;
};

export type EventsStackParamList = {
  EventsList: { newEvent?: boolean };
  Events: { screen: string; params: { event: Event } } | undefined;
  EventEdit: { event: Event };
  EventEditSection: { event: Event; section: string };
  EventEditFood: { event: Event };
  EventEditDrink: { event: Event };
  EventEditDecor: { event: Event };
  EventEditOutfit: { event: Event };
  EventEditNotes: { event: Event };
  EventInviteGuest: { event: Event };
  EventInviteGuestLink: { event: Event; linkList: UserInvite[] } | undefined;
  EventInviteGuestManual: { event: Event } | undefined;
  Profile: undefined;
  Account: undefined;
};

export type HomeStackParamList = {
  HomeView: undefined;
  HomeUpdates: { updates: InAppNotification[] };
  HomeFollows: { follows: InAppNotification[] };
  Profile: {
    screen: "ProfileView";
    params: { user: User };
  };
  Account: undefined;
  PhotoBooth: undefined;
};

export type InspirationStackParamList = {
  InspirationHome: { refresh: boolean };
  CreatePoll: undefined;
  CreatePost: undefined;
  Profile: undefined;
  Account: {
    screen: "Profile";
    params: { screen: "ProfileView"; params: { user: User } };
  };
  PollView: { refresh: boolean };
};

export type MainStackParamList = {
  Home: undefined;
  Contacts:
    | { screen: string; params: { open: boolean } | undefined }
    | undefined;
  Inspiration: undefined;
  Events: { screen: string; params: { event: Event | null } } | undefined;
  Calendar: undefined;
};

export type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
  OnboardingNameInput: undefined;
  OnboardingNotifications: undefined;
};

type PhotoBoothStackParamList = {
  PhotoBoothMain: undefined;
  PhotoBoothColorPicker: { type: string; color: string };
  PhotoBoothGalleryScreen: undefined;
  PhotoBoothPreviousPhoto: { selectedPhoto: Photo };
  PhotoBoothCustomise: undefined;
  PhotoBoothCustomiseLayout: undefined;
  PhotoBoothCustomiseTextColors: undefined;
  PhotoBoothCustomiseSettings: undefined;
  PhotoBoothPreview: undefined;
  PhotoBoothGuidedAccessInfo: undefined;
  PhotoBoothGalleryEvent: {
    title: string;
    photos: Photo[];
    eventId: string;
  };
};

export type ProfileStackParamList = {
  ProfileView: { user: User };
  ProfileInvite: { user: User };
  ProfileFollowers: { user: User; type: string | null };
};

export type EventInviteStackParamList = {
  EventInviteHome: { invite: Invite; event: Event; host: User };
  EventInviteGuests: { invite: Invite; event: Event; host: User };
  EventInviteItinerary: { invite: Invite; event: Event; host: User };
  EventInviteMusic: { invite: Invite; event: Event; host: User };
  EventInviteDietary: { invite: Invite; event: Event; host: User };
};

export type AllStackParamList =
  | AppStackParamList
  | AccountStackParamList
  | EventsStackParamList
  | ProfileStackParamList
  | CalendarStackParamList
  | ContactsStackParamList
  | InspirationStackParamList
  | HomeStackParamList
  | MainStackParamList
  | OnboardingStackParamList
  | PhotoBoothStackParamList;
