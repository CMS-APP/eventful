import { useCallback, useEffect, useRef, useState } from "react";

import { View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { EventsStackParamList } from "@/features/app/navigationTypes";
import { updateEventInDatabase } from "@/services/firebase/firebaseEventFunctions";

import { EventBudget } from "../budget/EventBudget";
import { EventBudgetList } from "../budget/EventBudgetList";

interface EventFoodEditProps {
  route: RouteProp<EventsStackParamList, "EventEditFood">;
}

export function EventFoodEdit({ route }: EventFoodEditProps) {
  const [event, setEvent] = useState(route.params.event);
  const [foodItems, setFoodItems] = useState(event.foodItems || []);
  const prevFoodItemsRef = useRef(foodItems);

  const updateEvent = useCallback(async () => {
    if (foodItems !== prevFoodItemsRef.current) {
      setEvent((prevEvent) => {
        const updatedEvent = { ...prevEvent, foodItems };
        updateEventInDatabase(updatedEvent);
        return updatedEvent;
      });
      prevFoodItemsRef.current = foodItems;
    }
  }, [foodItems]);

  useEffect(() => {
    updateEvent();
  }, [updateEvent]);

  return (
    <View>
      <EventBudget event={event} />
      <EventBudgetList
        title={"Food"}
        items={foodItems}
        setItems={setFoodItems}
      />
    </View>
  );
}
