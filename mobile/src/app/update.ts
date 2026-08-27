import { Linking, Platform } from "react-native";

const APP_STORE_URL = "https://apps.apple.com/app/id6449842590";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.hostinghappily.app";

const APPLE_SUBSCRIPTIONS_URL = "https://apps.apple.com/account/subscriptions";
const GOOGLE_PLAY_SUBSCRIPTIONS_URL =
  "https://play.google.com/store/account/subscriptions";

const getStoreUrl = (): string => {
  return Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
};

export async function openAppStore(): Promise<void> {
  const storeUrl = getStoreUrl();
  await Linking.openURL(storeUrl);
}

export async function openSubscriptionManagement(): Promise<void> {
  const url =
    Platform.OS === "ios"
      ? APPLE_SUBSCRIPTIONS_URL
      : GOOGLE_PLAY_SUBSCRIPTIONS_URL;
  await Linking.openURL(url);
}
