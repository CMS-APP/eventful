import { StyleSheet, View } from "react-native";

import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";

import { EventListItem } from "./EventListItem";

interface EventListEditProps {
  itemList: string[];
  completeList: boolean[];
  removeItem: (index: number) => void;
  completeItem: (index: number) => void;
  onPrevTextChange: (text: string, index: number) => void;
  itemTextFinish: (index: number) => void;
}

export function EventListEdit({
  itemList,
  completeList,
  removeItem,
  completeItem,
  onPrevTextChange,
  itemTextFinish
}: EventListEditProps) {
  if (itemList.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {itemList.map((item, index) => (
        <View key={index} style={[styles.row, index > 0 && styles.rowDivider]}>
          <EventListItem
            item={item}
            index={index}
            removeItem={removeItem}
            completeItem={completeItem}
            onPrevTextChange={onPrevTextChange}
            itemTextFinish={itemTextFinish}
            completeList={completeList}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.medium,
    paddingHorizontal: 16
  },
  row: {
    paddingVertical: 14
  },
  rowDivider: {
    borderTopColor: colors.lightGray,
    borderTopWidth: 1
  }
});
