import Purchases, { LOG_LEVEL } from "react-native-purchases";

import { Platform } from "react-native";

export const APIKeys = {
  apple: "appl_vEgCoymbcARgHbeFJiIwklqnzLs",
  google: "goog_uDISUbPwaDixBrUWEBDbmuxNTZj"
};

export async function storeInit(userId: string) {
  if (await Purchases.isConfigured()) {
    return;
  }

  const apiKey = Platform.OS === "ios" ? APIKeys.apple : APIKeys.google;

  Purchases.setLogLevel(LOG_LEVEL.INFO);
  Purchases.configure({ apiKey });
  await Purchases.logIn(userId);
}
