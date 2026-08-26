import React, { useCallback } from "react";

import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { InputAccessory } from "@/design-system/components/InputAccessory";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { BudgetItem } from "@/types/BudgetItem";
import { getCurrencySymbolForDevice } from "@/utils/currency";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

interface EventBudgetListItemProps {
  id: string;
  index: number;
  item: BudgetItem;
  setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  premium: boolean;
}

export function EventBudgetListItem({
  id,
  index,
  item,
  setItems,
  premium
}: EventBudgetListItemProps) {
  const handleRemove = useCallback(() => {
    haptics.soft();
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  }, [setItems, index]);

  const handleCostChange = useCallback(
    (text: string) => {
      const cost =
        text === "" ? 0 : Number.isNaN(Number(text)) ? 0 : Number(text);
      setItems((prevItems) =>
        prevItems.map((it, i) => (i === index ? { ...it, cost } : it))
      );
    },
    [setItems, index]
  );

  const displayCost = item.cost ?? 0;

  return (
    <View key={id} style={styles.container}>
      <View style={styles.itemContainer}>
        <Text type="body" style={styles.itemName} numberOfLines={1}>
          {item.item}
        </Text>
        <View style={styles.costRow}>
          <Text type="body" italic style={styles.currencyPrefix}>
            {getCurrencySymbolForDevice()}
          </Text>
          <TextInput
            style={styles.costInput}
            value={String(displayCost)}
            onChangeText={handleCostChange}
            keyboardType="numeric"
            editable={premium}
            selectTextOnFocus
            inputAccessoryViewID={`cost-${id}`}
          />

          <InputAccessory
            value={String(displayCost)}
            placeholder="Cost..."
            nativeID={`cost-${id}`}
          />
        </View>
      </View>
      <TouchableOpacity
        onPress={handleRemove}
        disabled={!premium}
        hitSlop={getHitSlop("medium")}
      >
        <View style={[padding.smallWidget, styles.removeButton]}>
          <Text type="body" style={styles.removeButtonText}>
            Remove
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    width: "100%"
  },
  costInput: {
    color: colors.white,
    flex: 1,
    minWidth: 48,
    padding: 0
  },
  costRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  currencyPrefix: {
    color: colors.white
  },
  itemContainer: {
    flex: 1
  },
  itemName: {
    color: colors.white
  },
  removeButton: {
    backgroundColor: colors.primary
  },
  removeButtonText: {
    color: colors.white,
    flex: 1,
    textAlign: "right"
  }
});
