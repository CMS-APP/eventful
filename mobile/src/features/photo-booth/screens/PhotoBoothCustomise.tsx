import { useState } from "react";

import { Screen } from "@/components/screen/Screen";
import { SegmentedIconControl } from "@/design-system/components/buttons/SegmentedIconControl";
import { colors } from "@/design-system/tokens/colors";

import { LayoutTab } from "../components/customise/tabs/LayoutTab";
import { PreviewTab } from "../components/customise/tabs/PreviewTab";
import { SettingsTab } from "../components/customise/tabs/SettingsTab";
import { TextColorsTab } from "../components/customise/tabs/TextColorsTab";

export function PhotoBoothCustomise() {
  const [selectedIcon, setSelectedIcon] = useState("images");

  return (
    <Screen
      contentConfig={{ tabBarPresent: true }}
      headerConfig={{
        type: "curvy-v2",
        curvyHeaderProps: {
          title: "Customise",
          subTitle: "Customise",
          icon: "cog",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
      nonScrollChildren={
        <SegmentedIconControl
          icons={["images", "font", "sliders-h", "eye"]}
          selectedIcon={selectedIcon}
          setSelectedIcon={setSelectedIcon}
        />
      }
      nonScrollConfig={{ paddingTop: 20 }}
    >
      {selectedIcon === "images" && <LayoutTab />}
      {selectedIcon === "font" && <TextColorsTab />}
      {selectedIcon === "sliders-h" && <SettingsTab />}
      {selectedIcon === "eye" && <PreviewTab />}
    </Screen>
  );
}
