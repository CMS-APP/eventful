import { ScrollView, StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";
import { trackPhotoBoothCustomised } from "@/services/analytics/events";

import { filters } from "../../../filters";
import { ColorButton } from "../ColorButton";
import { CustomiseCollage } from "../CustomiseCollage";
import { FilterButton } from "../FilterButton";
import { LivePreview } from "../LivePreview";

export function LayoutTab() {
  const { filter, setFilter, frameColor, textColor } = usePhotoBoothSettings();

  function handleFilterChange(nextFilter: string) {
    setFilter(nextFilter);
    trackPhotoBoothCustomised("filter");
  }

  return (
    <View style={styles.container}>
      <LivePreview />

      <Text type="subHeader">Layout</Text>
      <CustomiseCollage />

      <Text type="subHeader">Filters</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersRow}
      >
        {filters.map((option) => (
          <FilterButton
            key={option}
            filter={option}
            onPress={() => handleFilterChange(option)}
            isSelected={filter === option}
          />
        ))}
      </ScrollView>

      <Text type="subHeader">Colors</Text>
      <View style={styles.colorsRow}>
        <ColorButton color={frameColor} type="frame" />
        <ColorButton color={textColor} type="text" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  colorsRow: {
    flexDirection: "row",
    gap: 12
  },
  container: {
    gap: 12,
    marginTop: 24,
    paddingHorizontal: 24
  },
  filtersRow: {
    gap: 10,
    paddingHorizontal: 24
  },
  filtersScroll: {
    marginHorizontal: -24
  }
});
