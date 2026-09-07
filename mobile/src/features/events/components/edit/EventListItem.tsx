import { useCallback } from "react";

import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

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

  const complete = completeList[index];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleCompleteItem}
        hitSlop={getHitSlop("medium")}
      >
        <View
          style={[
            styles.completeButtonContent,
            {
              backgroundColor: complete ? colors.primary : colors.transparent,
              borderColor: complete ? colors.primary : colors.gray
            }
          ]}
        >
          {complete && (
            <FontAwesome5 name="check" size={14} color={colors.white} />
          )}
        </View>
      </TouchableOpacity>

      <TextInput
        value={item}
        onChangeText={handleTextChange}
        onEndEditing={handleTextFinish}
        style={[
          styles.textInput,
          complete && styles.textInputComplete
        ]}
      />

      <TouchableOpacity
        style={styles.removeButton}
        onPress={handleRemoveItem}
        hitSlop={getHitSlop("medium")}
      >
        <FontAwesome5 name="trash" size={18} color={colors.gray} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  completeButton: {
    justifyContent: "center"
  },
  completeButtonContent: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  removeButton: {
    justifyContent: "center"
  },
  textInput: {
    color: colors.black,
    flex: 1,
    fontFamily: "poppinsMediumItalic",
    fontSize: 15,
    textTransform: "none"
  },
  textInputComplete: {
    color: colors.gray,
    textDecorationLine: "line-through"
  }
});
