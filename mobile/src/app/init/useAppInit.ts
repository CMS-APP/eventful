import { useEffect } from "react";

import { useFonts } from "expo-font";

import { googleInit } from "@/app/init/google";
import { fonts } from "@/design-system/tokens/fonts";
import { useBackButtonHandler } from "@/hooks/useBackButtonHandler";
import { useNotificationHandler } from "@/hooks/useNotificationHandler";

export function useAppInit() {
  const [loaded, error] = useFonts(fonts);

  useBackButtonHandler();
  useNotificationHandler();

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
