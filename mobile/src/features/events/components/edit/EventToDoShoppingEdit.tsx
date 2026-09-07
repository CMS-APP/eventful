import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { IconButton } from "@/design-system/components/buttons/IconButton";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { Input } from "@/design-system/components/inputs/Input";
import { colors } from "@/design-system/tokens/colors";
import { trackEventListItemAdded } from "@/services/analytics/events";
import { Event } from "@/types/Event";
import { haptics } from "@/utils/haptics";

import { EventListEdit } from "./EventListEdit";
import { EventListProgressBar } from "./EventListProgressBar";

type ListType = "toDoList" | "shoppingList";

interface EventToDoShoppingEditProps {
  event: Event;
  setEvent: (event: Event) => void;
  initialTab?: string;
}

export function EventToDoShoppingEdit({
  event,
  setEvent,
  initialTab
}: EventToDoShoppingEditProps) {
  const [selectedButton, setSelectedButton] = useState(
    initialTab ?? "To Do List"
  );
  const listType: ListType =
    selectedButton === "To Do List" ? "toDoList" : "shoppingList";
  const placeholder =
    listType === "toDoList" ? "New To Do Item" : "New Shopping Item";

  const [itemList, setItemList] = useState<string[]>([]);
  const [completeList, setCompleteList] = useState<boolean[]>([]);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    const data = (event as any)[listType] || [];
    setItemList(data.map((item: { item: string }) => item.item));
    setCompleteList(data.map((item: { complete: boolean }) => item.complete));
  }, [event, listType]);

  const createDataToBeSaved = useCallback(
    (items: string[], completes: boolean[]) =>
      items.map((item, index) => ({ item, complete: completes[index] })),
    []
  );

  const saveData = useCallback(
    (items: string[], completes: boolean[]) => {
      setEvent({
        ...event,
        [listType]: createDataToBeSaved(items, completes)
      });
    },
    [setEvent, event, listType, createDataToBeSaved]
  );

  const onPrevTextChange = useCallback((text: string, index: number) => {
    setItemList((prev) => {
      const updated = [...prev];
      updated[index] = text;
      return updated;
    });
  }, []);

  const completeItem = useCallback(
    (index: number) => {
      const updated = [...completeList];
      updated[index] = !updated[index];
      setCompleteList(updated);
      saveData(itemList, updated);
      haptics.soft();
    },
    [completeList, itemList, saveData]
  );

  const removeItem = useCallback(
    (index: number) => {
      const updatedList = [...itemList];
      updatedList.splice(index, 1);
      setItemList(updatedList);

      const updatedCompleteList = [...completeList];
      updatedCompleteList.splice(index, 1);
      setCompleteList(updatedCompleteList);

      saveData(updatedList, updatedCompleteList);
      haptics.error();
    },
    [itemList, completeList, saveData]
  );

  const itemTextFinish = useCallback(
    (index: number) => {
      if (itemList[index]?.trim() === "") {
        removeItem(index);
      }
    },
    [itemList, removeItem]
  );

  const handleAddPress = useCallback(() => {
    if (newText.trim() === "") return;

    const newItemList = [...itemList, newText];
    const newCompleteList = [...completeList, false];
    setItemList(newItemList);
    setCompleteList(newCompleteList);
    setNewText("");
    saveData(newItemList, newCompleteList);
    trackEventListItemAdded(listType);
  }, [itemList, completeList, newText, listType, saveData]);

  const doneCount = completeList.filter(Boolean).length;

  return (
    <View style={styles.container}>
      <View style={styles.paddedSection}>
        <View style={styles.inputContainer}>
          <Input
            placeholder={placeholder}
            value={newText}
            onChangeText={setNewText}
            backgroundColor={colors.lightGray}
            textColor={colors.black}
            dark
            flex
          />

          <IconButton
            size="medium"
            marginTop={0}
            marginBottom={-24}
            iconName="plus"
            color={colors.primary}
            onPress={handleAddPress}
          />
        </View>
      </View>

      <SegmentedControl
        selections={["To Do List", "Shopping List"]}
        selectedButton={selectedButton}
        setSelectedButton={setSelectedButton}
        pressColor={colors.primary}
        nonPressColor={colors.white}
      />

      <View style={styles.paddedSection}>
        <EventListProgressBar total={itemList.length} doneCount={doneCount} />

        <EventListEdit
          itemList={itemList}
          completeList={completeList}
          removeItem={removeItem}
          completeItem={completeItem}
          onPrevTextChange={onPrevTextChange}
          itemTextFinish={itemTextFinish}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray,
    flex: 1
  },
  inputContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  paddedSection: {
    gap: 12,
    paddingBottom: 12,
    paddingHorizontal: 16
  }
});
