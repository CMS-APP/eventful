import { useCallback, useEffect, useRef, useState } from "react";

import { View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { EventsStackParamList } from "@/app/navigation";
import { updateEventInDatabase } from "@/services/firebase/event";

import { EventBudget } from "../budget/EventBudget";
import { EventBudgetList } from "../budget/EventBudgetList";

interface EventDrinkEditProps {
  route: RouteProp<EventsStackParamList, "EventEditDrink">;
}

export function EventDrinkEdit({ route }: EventDrinkEditProps) {
  const [event, setEvent] = useState(route.params.event);
  const [drinkItems, setDrinkItems] = useState(event.drinkItems || []);
  const prevDrinkItemsRef = useRef(drinkItems);

  const updateEvent = useCallback(async () => {
    if (drinkItems !== prevDrinkItemsRef.current) {
      setEvent((prevEvent) => {
        const updatedEvent = { ...prevEvent, drinkItems };
        updateEventInDatabase(updatedEvent);
        return updatedEvent;
      });
      prevDrinkItemsRef.current = drinkItems;
    }
  }, [drinkItems]);

  useEffect(() => {
    updateEvent();
  }, [updateEvent]);

  return (
    <View>
      <EventBudget event={event} />
      <EventBudgetList
        title={"Drink"}
        items={drinkItems}
        setItems={setDrinkItems}
      />
    </View>
  );
}
