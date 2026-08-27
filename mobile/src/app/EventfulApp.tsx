import { AppProvider } from "@/app/context/AppProvider";
import { useAppInit } from "@/app/init/useAppInit";
import { LoadingScreen } from "@/app/screens/LoadingScreen";
import { AppNavigator } from "@/features/app/AppNavigator";
import "@/services/firebase/firebase";

export function EventfulApp() {
  const { initialized } = useAppInit();

  return (
    <AppProvider>
      {initialized ? <AppNavigator /> : <LoadingScreen />}
    </AppProvider>
  );
}
