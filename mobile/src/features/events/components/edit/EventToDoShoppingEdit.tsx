import { useState } from "react";

import { StyleSheet, View } from "react-native";

import { AppButtonSwitcher } from "@/design-system/components/AppButtonSwitcher";
import { colors } from "@/design-system/tokens/colors";
import { Event } from "@/types/Event";

import { EventListEdit } from "./EventListEdit";

interface EventToDoShoppingEditProps {
  event: Event;
  setEvent: (event: Event) => void;
}

export function EventToDoShoppingEdit({
  event,
  setEvent
}: EventToDoShoppingEditProps) {
  const [selectedButton, setSelectedButton] = useState("To Do List");
  const selections = ["To Do List", "Shopping List"];

  return (
    <View style={styles.container}>
      <AppButtonSwitcher
        selections={selections}
        selectedButton={selectedButton}
        setSelectedButton={setSelectedButton}
        pressColor={colors.primary}
        nonPressColor={colors.white}
      />

      {selectedButton === "To Do List" ? (
        <EventListEdit
          event={event}
          setEvent={setEvent}
          listType="toDoList"
          placeholder="New To Do Item"
        />
      ) : (
        <EventListEdit
          event={event}
          setEvent={setEvent}
          listType="shoppingList"
          placeholder="New Shopping Item"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray,
    flex: 1
  }
});
