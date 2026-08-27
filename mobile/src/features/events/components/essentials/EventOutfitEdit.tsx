import { useCallback, useEffect, useRef, useState } from "react";

import { View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { EventsStackParamList } from "@/app/navigationTypes";
import { updateEventInDatabase } from "@/services/firebase/firebaseEventFunctions";

import { EventBudget } from "../budget/EventBudget";
import { EventBudgetList } from "../budget/EventBudgetList";

interface EventOutfitEditProps {
  route: RouteProp<EventsStackParamList, "EventEditOutfit">;
}

export function EventOutfitEdit({ route }: EventOutfitEditProps) {
  const [event, setEvent] = useState(route.params.event);
  const [outfitItems, setOutfitItems] = useState(event.outfitItems || []);
  const prevOutfitItemsRef = useRef(outfitItems);

  const updateEvent = useCallback(async () => {
    if (outfitItems !== prevOutfitItemsRef.current) {
      setEvent((prevEvent) => {
        const updatedEvent = { ...prevEvent, outfitItems };
        updateEventInDatabase(updatedEvent); // you can await here if you want
        return updatedEvent;
      });
      prevOutfitItemsRef.current = outfitItems;
    }
  }, [outfitItems]);

  useEffect(() => {
    updateEvent();
  }, [updateEvent]);

  return (
    <View>
      <EventBudget event={event} />
      <EventBudgetList
        title={"Outfit"}
        items={outfitItems}
        setItems={setOutfitItems}
      />
    </View>
  );
}
