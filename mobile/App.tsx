import * as Sentry from "@sentry/react-native";

import { EventfulApp } from "@/features/app/EventfulApp";
import { initializeSentry } from "@/features/app/utils/sentryInit";

initializeSentry();

export default Sentry.wrap(function App() {
  return <EventfulApp />;
});
