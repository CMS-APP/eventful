import { useEffect } from "react";

import { useFonts } from "expo-font";

import { usePushNotificationHandler } from "@/app/hooks/usePushNotificationHandler";
import { useWidgetLinkHandler } from "@/app/hooks/useWidgetLinkHandler";
import { googleInit } from "@/app/init/google";
import { fonts } from "@/design-system/tokens/fonts";

export function useAppInit() {
  const [loaded, error] = useFonts(fonts);

  usePushNotificationHandler();
  useWidgetLinkHandler();

  useEffect(() => {
    googleInit();
  }, []);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error, loaded]);

  return { initialized: loaded && !error };
}
