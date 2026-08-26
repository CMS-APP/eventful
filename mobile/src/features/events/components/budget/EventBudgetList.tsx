import { useSelector } from "react-redux";

import React, { useCallback, useState } from "react";

import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { AppStackParamList } from "@/features/app/navigationTypes";
import { UserState } from "@/store/UserSlice";
import { BudgetItem } from "@/types/BudgetItem";
import { getHitSlop } from "@/utils/hitSlop";

import { EventBudgetInput } from "./EventBudgetInput";
import { EventBudgetListItem } from "./EventBudgetListItem";

interface EventBudgetListProps {
  title: string;
  items: BudgetItem[];
  setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
}

export function EventBudgetList({
  title,
  items,
  setItems
}: EventBudgetListProps) {
  const [itemName, setItemName] = useState("");
  const [itemCost, setItemCost] = useState("");

  const premium = useSelector((state: UserState) => state.premium);
  const navigation = useNavigation() as StackNavigationProp<AppStackParamList>;

  const handlePaywallPress = useCallback(() => {
    if (!premium) {
      navigation.navigate("Paywall", { type: "Premium" });
    }
  }, [premium]);

  const addItem = useCallback(() => {
    if (!itemName) {
      return;
    }

    const cost =
      itemCost === ""
        ? 0
        : Number.isNaN(Number(itemCost))
          ? 0
          : Number(itemCost);

    setItems([
      ...items,
      {
        item: itemName,
        cost
      }
    ]);

    setItemName("");
    setItemCost("0");
  }, [itemName, itemCost, items, setItems]);

  const handleAddPress = useCallback(() => {
    addItem();
  }, [addItem]);

  const widgetStyle = [
    padding.mediumWidget,
    styles.container,
    {
      opacity: premium ? 1 : 0.4
    }
  ];

  return (
    <TouchableWithoutFeedback onPress={handlePaywallPress}>
      <View style={widgetStyle}>
        <Text type="subHeader">{title} List</Text>

        {items.map((item, index) => (
          <EventBudgetListItem
            key={`${item.item}-${index}`}
            id={item.item + index}
            index={index}
            item={item}
            setItems={setItems}
            premium={premium}
          />
        ))}

        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <EventBudgetInput
              placeholder={`${title} Item...`}
              value={itemName}
              premium={premium}
              handlePaywallPress={handlePaywallPress}
              onChangeText={(text) => setItemName(text)}
              preserveCase
            />
            <EventBudgetInput
              placeholder="Cost..."
              value={itemCost}
              premium={premium}
              handlePaywallPress={handlePaywallPress}
              onChangeText={(text) => setItemCost(text)}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            onPress={handleAddPress}
            disabled={!premium}
            hitSlop={getHitSlop("medium")}
          >
            <View style={[padding.smallWidget, styles.addButton]}>
              <Text type="body" style={styles.addButtonText}>
                Add
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: colors.primary,
    marginLeft: 10
  },
  addButtonText: {
    color: colors.white,
    flex: 1,
    textAlign: "right"
  },
  container: {
    backgroundColor: colors.lightGray,
    gap: 12,
    justifyContent: "center",
    marginTop: 20
  },
  inputContainer: {
    flex: 1,
    gap: 6
  },
  inputRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  }
});
