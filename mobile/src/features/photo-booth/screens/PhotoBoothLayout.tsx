import { ScrollView, StyleSheet, View } from "react-native";

import { Screen } from "@/components/screen/Screen";
import { SwitchButton } from "@/design-system/components/buttons/SwitchButton";
import { Divider } from "@/design-system/components/layout/Divider";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import { trackPhotoBoothCustomised } from "@/services/analytics/events";

import { CustomiseCollage } from "../components/customise/CustomiseCollage";
import { FilterButton } from "../components/customise/FilterButton";

export function PhotoBoothLayout() {
  const { canChangeCollage, setCanChangeCollage, filter, setFilter } =
    usePhotoBoothSettings();

  function handleCanChangeCollageChange() {
    setCanChangeCollage(!canChangeCollage);
    trackPhotoBoothCustomised("collage");
  }

  function handleFilterChange(nextFilter: string) {
    setFilter(nextFilter);
    trackPhotoBoothCustomised("filter");
  }

  return (
    <Screen
      contentConfig={{ tabBarPresent: true }}
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Photo Booth",
          subTitle: "Layout & Filters",
          icon: "images",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
    >
      <View style={styles.container}>
        <Text type="header">Layout</Text>
        <CustomiseCollage />

        <SwitchButton
          title="Allow Users to Change"
          isChecked={canChangeCollage}
          onChange={handleCanChangeCollageChange}
        />

        <Divider color={colors.lightGray} />

        <Text type="header">Filters</Text>

        <ScrollView horizontal>
          <View style={styles.filtersRow}>
            <FilterButton
              filter="Normal"
              onPress={() => handleFilterChange("Normal")}
              isSelected={filter === "Normal"}
            />

            <FilterButton
              filter="Black & White"
              onPress={() => handleFilterChange("Black & White")}
              isSelected={filter === "Black & White"}
            />

            <FilterButton
              filter="Sepia"
              onPress={() => handleFilterChange("Sepia")}
              isSelected={filter === "Sepia"}
            />

            <FilterButton
              filter="Vintage"
              onPress={() => handleFilterChange("Vintage")}
              isSelected={filter === "Vintage"}
            />

            <FilterButton
              filter="Warm"
              onPress={() => handleFilterChange("Warm")}
              isSelected={filter === "Warm"}
            />

            <FilterButton
              filter="Cool"
              onPress={() => handleFilterChange("Cool")}
              isSelected={filter === "Cool"}
            />

            <FilterButton
              filter="Kodachrome"
              onPress={() => handleFilterChange("Kodachrome")}
              isSelected={filter === "Kodachrome"}
            />

            <FilterButton
              filter="Polaroid"
              onPress={() => handleFilterChange("Polaroid")}
              isSelected={filter === "Polaroid"}
            />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 52,
    paddingHorizontal: 24
  },
  filtersRow: {
    flexDirection: "row",
    gap: 12
  }
});
