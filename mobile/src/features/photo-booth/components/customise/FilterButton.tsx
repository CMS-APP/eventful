import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { FilterWrapper } from "@/components/filters/FilterWrapper";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/utils/hitSlop";

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
  const size = 120;

  function image() {
    return (
      <Image
        source={imageSource}
        style={[styles.image, { width: size, height: size }]}
      />
    );
  }

  function getImage() {
    const needsGrain =
      filter === "Black & White" ||
      filter === "Vintage" ||
      filter === "Polaroid";
    const isVintage = filter === "Vintage";
    const wrapperSize = isVintage ? size + 4 : size;

    return (
      <FilterWrapper
        filter={filter}
        width={wrapperSize}
        height={wrapperSize}
        showGrain={needsGrain}
      >
        <View style={[styles.imageWrapper, { width: size, height: size }]}>
          {image()}
        </View>
      </FilterWrapper>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, isSelected && styles.selectedContainer]}
      hitSlop={getHitSlop("small")}
    >
      {getImage()}
      <Text type="body">{filter}</Text>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <FontAwesome5 name="check" size={16} color={colors.white} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.white,
    borderRadius: 6,
    borderWidth: 3,
    gap: 12,
    marginBottom: 8,
    marginTop: 8,
    padding: 12,
    width: 160
  },
  image: {
    alignSelf: "center",
    borderColor: colors.lightGray,
    borderRadius: 12,
    borderWidth: 2
  },
  imageWrapper: {
    alignSelf: "center"
  },
  selectedContainer: {
    borderColor: colors.secondary
  },
  selectedIndicator: {
    alignItems: "center",
    backgroundColor: colors.secondary,
    borderRadius: 6,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: -8,
    top: -8,
    width: 20
  }
});
