import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";

export function PhotoBoothInspiration() {
  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Inspiration",
          backgroundColor: colors.primary,
          icon: "star",
          color: colors.white,
          accountButton: false,
          backAction: true
        }
      }}
    ></Screen>
  );
}
