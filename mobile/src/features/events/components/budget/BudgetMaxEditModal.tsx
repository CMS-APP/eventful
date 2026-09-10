import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getCurrencySymbolForDevice } from "@/utils/currency";

interface BudgetMaxEditModalProps {
  visible: boolean;
  setVisible: (show: boolean) => void;
  budgetMaximum: number;
  onSave: (budgetMaximum: number) => void;
}

export function BudgetMaxEditModal({
  visible,
  setVisible,
  budgetMaximum,
  onSave
}: BudgetMaxEditModalProps) {
  const [amountText, setAmountText] = useState(String(budgetMaximum || ""));

  useEffect(() => {
    if (!visible) return;
    setAmountText(budgetMaximum ? String(budgetMaximum) : "");
  }, [visible, budgetMaximum]);

  const handleSave = () => {
    onSave(Number(amountText) || 0);
    setVisible(false);
  };

  return (
    <ModalView show={visible} setShow={setVisible}>
      <View style={styles.headerContainer}>
        <Text type="header" color={colors.black}>
          Edit Budget
        </Text>
      </View>

      <Input
        placeholder={`Budget (${getCurrencySymbolForDevice()})`}
        value={amountText}
        onChangeText={setAmountText}
        backgroundColor={colors.lightGray}
        textColor={colors.black}
        keyboardType="numeric"
      />

      <Button
        text="Save"
        onPress={handleSave}
        color={colors.primary}
        textColor={colors.white}
        leadingIcon="check"
      />
    </ModalView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: "center"
  }
});
