import { AppProvider } from "@/app/context/AppProvider";
import { useAppInit } from "@/app/init/useAppInit";
import "@/services/firebase/firebase";

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
