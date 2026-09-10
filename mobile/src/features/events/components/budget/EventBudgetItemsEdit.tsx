import React, { useCallback } from "react";

import { View } from "react-native";

import { BudgetItem } from "@/types/BudgetItem";
import { Event } from "@/types/Event";

import { EventBudget } from "./EventBudget";
import { EventBudgetList } from "./EventBudgetList";

type BudgetItemsField = "foodItems" | "drinkItems" | "decorItems" | "outfitItems";

interface EventBudgetItemsEditProps {
  event: Event;
  setEvent: React.Dispatch<React.SetStateAction<Event>>;
  field: BudgetItemsField;
  title: string;
}

export function EventBudgetItemsEdit({
  event,
  setEvent,
  field,
  title
}: EventBudgetItemsEditProps) {
  const items = event[field] ?? [];

  const setItems: React.Dispatch<React.SetStateAction<BudgetItem[]>> =
    useCallback(
      (update) =>
        setEvent((prev) => ({
          ...prev,
          [field]:
            typeof update === "function"
              ? (update as (items: BudgetItem[]) => BudgetItem[])(
                  prev[field] ?? []
                )
              : update
        })),
      [setEvent, field]
    );

  return (
    <View>
      <EventBudget event={event} />
      <EventBudgetList title={title} items={items} setItems={setItems} />
    </View>
  );
}
