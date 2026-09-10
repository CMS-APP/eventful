import { useSelector } from "react-redux";

import { Dispatch, SetStateAction, useCallback, useState } from "react";

import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import {
  BudgetCategoryField,
  getBudgetSummary,
  getCategoryConfig
} from "@/features/events/utils/budget";
import {
  trackEventBudgetItemAdded,
  trackEventBudgetItemPaidToggled,
  trackEventBudgetItemRemoved
} from "@/services/analytics/events";
import { UserState } from "@/store/UserSlice";
import { BudgetItem } from "@/types/BudgetItem";
import { Event } from "@/types/Event";
import { getCurrencySymbolForDevice } from "@/utils/currency";

import { BudgetItemModal } from "./BudgetItemModal";
import { BudgetItemRow } from "./BudgetItemRow";
import { BudgetSpendCard } from "./BudgetSpendCard";

interface EventBudgetCategoryEditProps {
  event: Event;
  setEvent: Dispatch<SetStateAction<Event>>;
  field: BudgetCategoryField;
  title: string;
}

export function EventBudgetCategoryEdit({
  event,
  setEvent,
  field,
  title
}: EventBudgetCategoryEditProps) {
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const premium = useSelector((state: UserState) => state.premium);
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;

  const currency = getCurrencySymbolForDevice();
  const items = event[field] ?? [];
  const summary = getBudgetSummary(event);
  const categoryConfig = getCategoryConfig(field);
  const categorySpend = summary.perCategory[field].spent;

  const handlePaywallPress = useCallback(() => {
    navigation.navigate("Paywall", { type: "Premium" });
  }, [navigation]);

  const setItems = useCallback(
    (updater: (items: BudgetItem[]) => BudgetItem[]) => {
      setEvent((prev) => ({
        ...prev,
        [field]: updater(prev[field] ?? [])
      }));
    },
    [setEvent, field]
  );

  const handleAddPress = useCallback(() => {
    if (!premium) {
      handlePaywallPress();
      return;
    }
    setEditingIndex(null);
    setShowItemModal(true);
  }, [premium, handlePaywallPress]);

  const handleRowPress = useCallback((index: number) => {
    setEditingIndex(index);
    setShowItemModal(true);
  }, []);

  const handleTogglePaid = useCallback(
    (index: number) => {
      let nextPaid = false;
      setItems((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;
          nextPaid = !(item.paid ?? false);
          return { ...item, paid: nextPaid };
        })
      );
      trackEventBudgetItemPaidToggled(title, nextPaid);
    },
    [setItems, title]
  );

  const handleSaveItem = useCallback(
    (item: BudgetItem) => {
      if (editingIndex === null) {
        setItems((prev) => [...prev, item]);
        trackEventBudgetItemAdded(title);
      } else {
        setItems((prev) =>
          prev.map((prevItem, i) => (i === editingIndex ? item : prevItem))
        );
      }
    },
    [editingIndex, setItems, title]
  );

  const handleDeleteItem = useCallback(() => {
    if (editingIndex === null) return;
    setItems((prev) => prev.filter((_, i) => i !== editingIndex));
    trackEventBudgetItemRemoved(title);
  }, [editingIndex, setItems, title]);

  const editingItem = editingIndex !== null ? items[editingIndex] : null;
  const opacity = premium ? 1 : 0.4;

  return (
    <TouchableWithoutFeedback
      onPress={!premium ? handlePaywallPress : undefined}
    >
      <View style={[styles.container, { opacity }]}>
        <BudgetSpendCard
          title={title}
          color={categoryConfig.color}
          spent={categorySpend}
          summary={summary}
        />

        {items.length > 0 && (
          <View style={styles.listCard}>
            <View style={styles.listHeaderRow}>
              <Text type="caption" color={colors.gray}>
                PAID
              </Text>
              <Text type="caption" color={colors.gray} style={styles.flex1}>
                {title.toUpperCase()} LIST
              </Text>
              <Text type="caption" color={colors.gray}>
                COST
              </Text>
            </View>

            {items.map((item, index) => (
              <BudgetItemRow
                key={`${item.item}-${index}`}
                item={item}
                premium={premium}
                onTogglePaid={() => handleTogglePaid(index)}
                onPress={() => handleRowPress(index)}
                onPaywallPress={handlePaywallPress}
              />
            ))}

            <View style={styles.totalRow}>
              <Text type="subHeader" color={colors.black}>
                TOTAL
              </Text>
              <Text type="subHeader" color={colors.primary}>
                {currency}
                {categorySpend}
              </Text>
            </View>
          </View>
        )}

        <Button
          text="Add Item"
          onPress={handleAddPress}
          leadingIcon={"plus"}
          color={colors.primary}
          textColor={colors.white}
          fullWidth
        />

        <BudgetItemModal
          visible={showItemModal}
          setVisible={setShowItemModal}
          title={title}
          initialItem={editingItem}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16
  },
  flex1: {
    flex: 1
  },
  listCard: {
    backgroundColor: colors.white,
    borderColor: colors.lightGray,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
    padding: 20
  },
  listHeaderRow: {
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8
  },
  totalRow: {
    borderTopColor: colors.lightGray,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12
  }
});
