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
  ForgotPassword: undefined;
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
  Account:
    | {
        screen: "Profile";
        params: { screen: "ProfileView"; params: { user: User } };
      }
    | undefined;
  CreatePoll: undefined;
  CreatePost: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Contacts:
    | { screen: string; params: { open: boolean } | undefined }
    | undefined;
  PhotoBooth: undefined;
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
  | HomeStackParamList
  | MainStackParamList
  | OnboardingStackParamList
  | PhotoBoothStackParamList;

export interface NestedResetStep {
  name: string;
  params?: object;
  fallback?: string;
}

function buildRoute(steps: NestedResetStep[], index: number): any {
  if (index >= steps.length) {
    return undefined;
  }

  const step = steps[index];
  const nextRoute = buildRoute(steps, index + 1);

  const state = nextRoute
    ? step.fallback
      ? { index: 1, routes: [{ name: step.fallback }, nextRoute] }
      : { index: 0, routes: [nextRoute] }
    : undefined;

  return {
    name: step.name,
    ...(step.params ? { params: step.params } : {}),
    ...(state ? { state } : {})
  };
}

export function buildNestedResetState(
  steps: NestedResetStep[],
  options?: { background?: string }
) {
  const chainRoute = buildRoute(steps, 0);
  const routes = options?.background
    ? [{ name: options.background }, chainRoute]
    : [chainRoute];

  return {
    index: routes.length - 1,
    routes
  };
}
