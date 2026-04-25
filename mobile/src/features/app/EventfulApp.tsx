import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useNetwork } from "@/hooks/useNetwork";
import { AppProvider } from "@/providers/AppProvider";
import "@/services/firebase/firebase";
import { initializeGoogleSignin } from "@/services/googleSignIn";
import { eventfulAsciiArt } from "@/utils/ascii";
import { log } from "@/utils/logging";

import { AppNavigator } from "./AppNavigator";
import { LoadingScreen } from "./screens/LoadingScreen";

log(eventfulAsciiArt(), "info");
initializeGoogleSignin();

export function EventfulApp() {
  const { initialized } = useAppInitialization();
  const { isInternetReachable } = useNetwork();

  return (
    <AppProvider>
      {initialized && isInternetReachable ? (
        <AppNavigator />
      ) : (
        <LoadingScreen />
      )}
    </AppProvider>
  );
}
