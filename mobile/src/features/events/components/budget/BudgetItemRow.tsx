import { useCallback } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { BudgetItem } from "@/types/BudgetItem";
import { getCurrencySymbolForDevice } from "@/utils/currency";
import { haptics } from "@/utils/haptics";

interface BudgetItemRowProps {
  item: BudgetItem;
  premium: boolean;
  onTogglePaid: () => void;
  onPress: () => void;
  onPaywallPress: () => void;
}

export function BudgetItemRow({
  item,
  premium,
  onTogglePaid,
  onPress,
  onPaywallPress
}: BudgetItemRowProps) {
  const currency = getCurrencySymbolForDevice();
  const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
  const paid = item.paid ?? false;

  const handleTogglePaid = useCallback(() => {
    if (!premium) {
      onPaywallPress();
      return;
    }
    haptics.soft();
    onTogglePaid();
  }, [premium, onPaywallPress, onTogglePaid]);

  const handlePress = useCallback(() => {
    if (!premium) {
      onPaywallPress();
      return;
    }
    onPress();
  }, [premium, onPaywallPress, onPress]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleTogglePaid}
        hitSlop={getHitSlop("medium")}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: paid ? colors.primary : colors.transparent,
              borderColor: paid ? colors.primary : colors.gray
            }
          ]}
        >
          {paid && <FontAwesome5 name="check" size={14} color={colors.white} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePress} style={styles.itemContainer}>
        <Text type="body" color={colors.black} numberOfLines={1}>
          {item.item}
          {quantity > 1 ? ` x${quantity}` : ""}
        </Text>
        {quantity > 1 && (
          <Text type="caption" color={colors.gray}>
            {currency}
            {(item.cost / quantity).toFixed(2)} EACH
          </Text>
        )}
      </TouchableOpacity>

      <Text type="body" color={colors.black}>
        {currency}
        {item.cost}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 8
  },
  itemContainer: {
    flex: 1,
    gap: 2
  }
});
