import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";

import { Calendar } from "../components/Calendar";

export function CalendarScreen() {
  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Calendar",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "calendar"
        }
      }}
    >
      <Calendar />
    </Screen>
  );
}
