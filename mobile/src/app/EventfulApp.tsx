import { AppProvider } from "@/app/context/AppProvider";
import "@/app/init/firebase";
import { useAppInit } from "@/app/init/useAppInit";

import { LoadingScreen } from "../app/screens/LoadingScreen";
import { AppNavigator } from "./AppNavigator";

export function EventfulApp() {
  const { initialized } = useAppInit();

  return (
    <AppProvider>
      {initialized ? <AppNavigator /> : <LoadingScreen />}
    </AppProvider>
  );
}
