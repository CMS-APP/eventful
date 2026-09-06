import { useCallback, useEffect, useRef, useState } from "react";

import { View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { EventsStackParamList } from "@/app/navigation";
import { trackEventUpdated } from "@/services/analytics/events";
import { updateEventInDatabase } from "@/services/firebase/event";

import { EventBudget } from "../budget/EventBudget";
import { EventBudgetList } from "../budget/EventBudgetList";

interface EventDecorEditProps {
  route: RouteProp<EventsStackParamList, "EventEditDecor">;
}

export function EventDecorEdit({ route }: EventDecorEditProps) {
  const [event, setEvent] = useState(route.params.event);
  const [decorItems, setDecorItems] = useState(event.decorItems || []);
  const prevDecorItemsRef = useRef(decorItems);

  const updateEvent = useCallback(async () => {
    if (decorItems !== prevDecorItemsRef.current) {
      setEvent((prevEvent) => {
        const updatedEvent = { ...prevEvent, decorItems };
        updateEventInDatabase(updatedEvent);
        trackEventUpdated();
        return updatedEvent;
      });
      prevDecorItemsRef.current = decorItems;
    }
  }, [decorItems]);

  useEffect(() => {
    updateEvent();
  }, [updateEvent]);

  return (
    <View>
      <EventBudget event={event} />
      <EventBudgetList
        title={"Decor"}
        items={decorItems}
        setItems={setDecorItems}
      />
    </View>
  );
}
