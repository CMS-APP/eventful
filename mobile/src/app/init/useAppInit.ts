import { useEffect } from "react";

import { useFonts } from "expo-font";

import { useBackButtonHandler } from "@/app/hooks/useBackButtonHandler";
import { useNotificationHandler } from "@/app/hooks/useNotificationHandler";
import { googleInit } from "@/app/init/google";
import { fonts } from "@/design-system/tokens/fonts";

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
