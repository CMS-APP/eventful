import { useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { BudgetItem } from "@/types/BudgetItem";
import { getCurrencySymbolForDevice } from "@/utils/currency";

interface BudgetItemModalProps {
  visible: boolean;
  setVisible: (show: boolean) => void;
  title: string;
  initialItem: BudgetItem | null;
  onSave: (item: BudgetItem) => void;
  onDelete: () => void;
}

export function BudgetItemModal({
  visible,
  setVisible,
  title,
  initialItem,
  onSave,
  onDelete
}: BudgetItemModalProps) {
  const isEditing = !!initialItem;

  const [name, setName] = useState("");
  const [costText, setCostText] = useState("");
  const [quantityText, setQuantityText] = useState("1");

  useEffect(() => {
    if (!visible) return;
    setName(initialItem?.item ?? "");
    setCostText(initialItem ? String(initialItem.cost) : "");
    setQuantityText(String(initialItem?.quantity ?? 1));
  }, [visible, initialItem]);

  const handleSave = () => {
    if (!name.trim()) return;

    const item: BudgetItem = {
      item: name.trim(),
      cost: Number(costText) || 0,
      quantity: Number(quantityText) || 1,
      paid: initialItem?.paid ?? false
    };

    onSave(item);
    setVisible(false);
  };

  const handleDelete = () => {
    onDelete();
    setVisible(false);
  };

  const cost = Number(costText) || 0;
  const quantity = Number(quantityText) || 0;
  const showEachPrice = quantity > 1 && cost > 0;
  const currency = getCurrencySymbolForDevice();

  return (
    <ModalView show={visible} setShow={setVisible}>
      <View style={styles.headerContainer}>
        <Text type="header" color={colors.black}>
          {isEditing ? `Edit ${title} Item` : `Add ${title} Item`}
        </Text>

        <View style={styles.flex}>
          {isEditing && (
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={getHitSlop("medium")}
            >
              <FontAwesome5 name="trash" size={24} color={colors.black} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Input
        placeholder={`${title} Item`}
        value={name}
        onChangeText={setName}
        backgroundColor={colors.lightGray}
        textColor={colors.black}
      />

      <View style={styles.row}>
        <Input
          placeholder={`Cost (${getCurrencySymbolForDevice()})`}
          value={costText}
          onChangeText={setCostText}
          backgroundColor={colors.lightGray}
          textColor={colors.black}
          keyboardType="numeric"
          flex
        />
        <Input
          placeholder="Quantity"
          value={quantityText}
          onChangeText={setQuantityText}
          backgroundColor={colors.lightGray}
          textColor={colors.black}
          keyboardType="numeric"
          flex
        />
      </View>

      {showEachPrice && (
        <Text type="caption" color={colors.gray}>
          {currency}
          {cost} / {quantity} = {currency}
          {(cost / quantity).toFixed(2)} each
        </Text>
      )}

      <Button
        text={isEditing ? "Save Changes" : `Add ${title} Item`}
        onPress={handleSave}
        color={colors.primary}
        textColor={colors.white}
        leadingIcon={isEditing ? "check" : "plus"}
      />
    </ModalView>
  );
}

const styles = StyleSheet.create({
  flex: {
    alignItems: "flex-end",
    flex: 1
  },
  headerContainer: {
    flexDirection: "row"
  },
  row: {
    flexDirection: "row",
    gap: 12
  }
});
