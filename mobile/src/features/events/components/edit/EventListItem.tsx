import { useCallback } from "react";

import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

interface EventListItemProps {
  item: string;
  index: number;
  removeItem: (index: number) => void;
  completeItem: (index: number) => void;
  onPrevTextChange: (text: string, index: number) => void;
  itemTextFinish: (index: number) => void;
  completeList: boolean[];
}

export function EventListItem({
  item,
  index,
  removeItem,
  completeItem,
  onPrevTextChange,
  itemTextFinish,
  completeList
}: EventListItemProps) {
  const handleRemoveItem = useCallback(() => {
    removeItem(index);
    haptics.error();
  }, [removeItem, index]);

  const handleCompleteItem = useCallback(() => {
    if (completeList[index]) {
      haptics.error();
    } else {
      haptics.success();
    }
    completeItem(index);
  }, [completeList, index, completeItem]);

  const handleTextChange = useCallback(
    (text: string) => {
      onPrevTextChange(text, index);
    },
    [onPrevTextChange, index]
  );

  const handleTextFinish = useCallback(() => {
    itemTextFinish(index);
  }, [itemTextFinish, index]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={handleRemoveItem}
        hitSlop={getHitSlop("medium")}
      >
        <View style={styles.removeButtonContent}>
          <FontAwesome5 name="trash" size={20} color={colors.black} />
        </View>
      </TouchableOpacity>

      <TextInput
        value={item}
        onChangeText={handleTextChange}
        onEndEditing={handleTextFinish}
        style={styles.textInput}
      />

      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleCompleteItem}
        hitSlop={getHitSlop("medium")}
      >
        <View
          style={[
            styles.completeButtonContent,
            {
              backgroundColor: completeList[index]
                ? colors.primaryTint
                : colors.lightGray
            }
          ]}
        >
          <FontAwesome5
            name="check"
            size={20}
            color={completeList[index] ? colors.white : colors.black}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  completeButton: {
    justifyContent: "center",
    marginLeft: 6
  },
  completeButtonContent: {
    alignItems: "center",
    borderColor: colors.lightGray + "33",
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    padding: 8
  },
  container: {
    alignItems: "stretch",
    flexDirection: "row"
  },
  removeButton: {
    justifyContent: "center",
    marginRight: 6
  },
  removeButtonContent: {
    ...globalStyles.smallWidget,
    backgroundColor: colors.lightGray,
    justifyContent: "center"
  },
  textInput: {
    ...globalStyles.smallWidget,
    backgroundColor: colors.lightGray,
    flex: 1,
    fontSize: 12,
    justifyContent: "center",
    letterSpacing: 2,
    textTransform: "none"
  }
});
