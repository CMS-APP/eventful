import { useCallback } from "react";

import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { getCurrencySymbolForDevice } from "@/utils/currency";
import { haptics } from "@/utils/haptics";

import { BudgetSegmentedBar } from "./BudgetSegmentedBar";

interface BudgetCategoryGridButtonProps {
  title: string;
  image: number;
  color: string;
  spent: number;
  denominator: number;
  itemCount: number;
  onPress: () => void;
}

export function BudgetCategoryGridButton({
  title,
  image,
  color,
  spent,
  denominator,
  itemCount,
  onPress
}: BudgetCategoryGridButtonProps) {
  const currency = getCurrencySymbolForDevice();

  const handlePress = useCallback(() => {
    haptics.soft();
    onPress();
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.flexContainer}
      hitSlop={getHitSlop("small")}
    >
      <View style={styles.button}>
        <View style={styles.topRow}>
          <Image source={image} style={styles.image} tintColor={colors.black} />
          <FontAwesome5 name="chevron-right" size={16} color={colors.gray} />
        </View>

        <Text type="body" color={colors.black}>
          {title}
        </Text>

        <Text type="header" color={colors.primary} style={styles.amount}>
          {currency}
          {spent}
        </Text>

        <BudgetSegmentedBar
          segments={[{ color, value: spent }]}
          denominator={denominator}
          height={4}
        />

        <Text type="caption" color={colors.gray}>
          {itemCount} {itemCount === 1 ? "ITEM" : "ITEMS"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  amount: {
    marginVertical: -2
  },
  button: {
    ...card.small,
    ...padding.mediumWidget,
    alignItems: "flex-start",
    gap: 6
  },
  flexContainer: {
    flex: 1
  },
  image: {
    height: 40,
    tintColor: colors.black,
    width: 40
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  }
});
