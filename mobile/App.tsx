import * as Sentry from "@sentry/react-native";

import { EventfulApp } from "@/app/EventfulApp";
import { sentryInit } from "@/app/init/sentry";

sentryInit();

export default Sentry.wrap(function App() {
  return <EventfulApp />;
});
