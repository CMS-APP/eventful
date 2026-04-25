import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { getHitSlop } from "@/utils/hitSlop";

interface TimelineButtonProps {
  index: number;
  updateList: (index: number) => void;
  textList: string[];
  timelineList: boolean[];
}

export function TimelineButton({
  index,
  updateList,
  textList,
  timelineList
}: TimelineButtonProps) {
  const isCompleted = timelineList[index];

  return (
    <TouchableOpacity
      onPress={() => {
        updateList(index);
      }}
      style={styles.container}
      hitSlop={getHitSlop("medium")}
    >
      <View style={styles.button}>
        <Text type="subHeader" color={colors.black} center>
          {textList[index]}
        </Text>
        <View style={styles.checkContainer}>
          <View
            style={
              isCompleted ? styles.completedCheck : styles.notCompletedCheck
            }
          >
            <FontAwesome5
              name="check"
              size={40}
              color={colors.black}
              style={
                isCompleted ? styles.completedIcon : styles.notCompletedIcon
              }
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    ...globalStyles.largeWidget,
    backgroundColor: colors.lightGray,
    gap: 12,
    width: "75%"
  },
  checkContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  completedCheck: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8
  },
  completedIcon: {
    opacity: 1
  },
  container: {
    alignItems: "center",
    width: "100%"
  },
  notCompletedCheck: {
    backgroundColor: colors.transparent,
    borderColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    padding: 6
  },
  notCompletedIcon: {
    opacity: 0.1
  }
});
