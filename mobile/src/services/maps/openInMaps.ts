import { Alert, Linking, Platform } from "react-native";

import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

const GOOGLE_MAPS_IOS_SCHEME = "comgooglemaps://";

async function openAppleMaps(query: string) {
  await Linking.openURL(
    `https://maps.apple.com/?q=${encodeURIComponent(query)}`
  );
}

async function openGoogleMaps(query: string) {
  await Linking.openURL(
    `${GOOGLE_MAPS_IOS_SCHEME}?q=${encodeURIComponent(query)}`
  );
}

export async function openInMaps(address: string) {
  try {
    if (Platform.OS === "android") {
      await Linking.openURL(`geo:0,0?q=${encodeURIComponent(address)}`);
      return;
    }

    const canOpenGoogleMaps = await Linking.canOpenURL(GOOGLE_MAPS_IOS_SCHEME);
    if (!canOpenGoogleMaps) {
      await openAppleMaps(address);
      return;
    }

    Alert.alert("Open Directions", "Choose an app", [
      { text: "Apple Maps", onPress: () => openAppleMaps(address) },
      { text: "Google Maps", onPress: () => openGoogleMaps(address) },
      { text: "Cancel", style: "cancel" }
    ]);
  } catch (error) {
    showErrorToast("Error Opening Maps");
    log("Error Opening Maps: " + error, "error");
  }
}
