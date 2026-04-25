import { useEffect } from "react";

import { useFonts } from "expo-font";

import { fonts } from "@/styles/fonts";
import { AppError } from "@/utils/error";
import { fetchUpdate } from "@/utils/expoUpdate";

export function useAppInitialization() {
  const [loaded, error] = useFonts(fonts);

  useEffect(() => {
    fetchUpdate();
  }, []);

  useEffect(() => {
    if (error) {
      throw new AppError(error, "App: Error loading fonts");
    }
  }, [error, loaded]);

  return { initialized: loaded && !error };
}
