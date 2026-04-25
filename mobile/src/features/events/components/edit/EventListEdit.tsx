import { useCallback, useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Input } from "@/components/inputs/Input";
import { colors } from "@/styles/colors";
import { Event } from "@/types/Event";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

import { EventListItem } from "./EventListItem";

interface EventListEditProps {
  event: Event;
  setEvent: (event: Event) => void;
  listType: "checklist" | "toDoList" | "shoppingList";
  placeholder?: string;
}

export function EventListEdit({
  event,
  setEvent,
  listType,
  placeholder = "New Item"
}: EventListEditProps) {
  const [itemList, setItemList] = useState<string[]>([]);
  const [completeList, setCompleteList] = useState<boolean[]>([]);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    // Check if listType is in event
    if (listType in event) {
      const data = (event as any)[listType];
      setItemList(data.map((item: { item: string }) => item.item));
      setCompleteList(data.map((item: { complete: boolean }) => item.complete));
    } else {
      setItemList([]);
      setCompleteList([]);
    }
  }, [event, listType]);

  const createDataToBeSaved = useCallback(
    (items: string[], completes: boolean[]) => {
      return items.map((item, index) => ({
        item,
        complete: completes[index]
      }));
    },
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

  const onPrevTextChange = useCallback(
    (text: string, index: number) => {
      const updatedList = [...itemList];
      updatedList[index] = text;
      setItemList(updatedList);
    },
    [itemList]
  );

  const completeItem = useCallback(
    (index: number) => {
      const updatedList = [...completeList];
      updatedList[index] = !updatedList[index];
      setCompleteList(updatedList);
      saveData(itemList, updatedList);
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
    setEvent({
      ...event,
      [listType]: createDataToBeSaved(newItemList, newCompleteList)
    });
  }, [
    itemList,
    completeList,
    newText,
    event,
    listType,
    createDataToBeSaved,
    setEvent
  ]);

  return (
    <View style={styles.container}>
      {itemList !== null &&
        itemList.map((item, index) => (
          <EventListItem
            key={`${listType}-${index}-${item}`}
            item={item}
            index={index}
            removeItem={removeItem}
            completeItem={completeItem}
            onPrevTextChange={onPrevTextChange}
            itemTextFinish={itemTextFinish}
            completeList={completeList}
          />
        ))}
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

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPress}
          hitSlop={getHitSlop("medium")}
        >
          <FontAwesome5 name="plus" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    marginBottom: 12
  },
  container: {
    flex: 1,
    gap: 16,
    marginHorizontal: 24,
    marginTop: 12
  },
  inputContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    marginTop: 6
  }
});
