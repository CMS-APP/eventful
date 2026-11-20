import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { FilterWrapper } from "@/features/photo-booth/components/customise/FilterWrapper";

const SIZE = 84;

interface FilterButtonProps {
  filter: string;
  onPress: () => void;
  isSelected: boolean;
}

export function FilterButton({
  filter,
  onPress,
  isSelected
}: FilterButtonProps) {
  const imageSource = require(`@/assets/backgrounds/welcome-background.png`);
  const needsGrain =
    filter === "Black & White" || filter === "Vintage" || filter === "Polaroid";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      hitSlop={getHitSlop("small")}
    >
      <View style={styles.tile}>
        <FilterWrapper
          filter={filter}
          width={SIZE}
          height={SIZE}
          showGrain={needsGrain}
        >
          <Image source={imageSource} style={styles.image} />
        </FilterWrapper>
        {isSelected && <View style={styles.selectedBorder} />}
      </View>

      <Text
        type={isSelected ? "subHeader" : "body"}
        color={isSelected ? colors.primary : colors.darkGray}
        style={styles.label}
        numberOfLines={2}
      >
        {filter}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    gap: 6,
    width: SIZE
  },
  image: {
    height: SIZE,
    width: SIZE
  },
  label: {
    fontSize: 9,
    letterSpacing: 1,
    lineHeight: 12,
    textAlign: "center",
    textTransform: "uppercase",
    width: SIZE
  },
  selectedBorder: {
    ...StyleSheet.absoluteFill,
    borderColor: colors.secondary,
    borderRadius: 16,
    borderWidth: 3
  },
  tile: {
    borderRadius: 16,
    height: SIZE,
    overflow: "hidden",
    width: SIZE
  }
});
