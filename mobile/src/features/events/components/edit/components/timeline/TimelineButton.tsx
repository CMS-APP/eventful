import { useRef } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import {
  Confetti,
  ConfettiHandle
} from "@/design-system/components/feedback/Confetti";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { haptics } from "@/utils/haptics";

interface TimelineButtonProps {
  index: number;
  updateList: (index: number) => void;
  textList: string[];
  timelineList: boolean[];
  onNavigate?: () => void;
}

export function TimelineButton({
  index,
  updateList,
  textList,
  timelineList,
  onNavigate
}: TimelineButtonProps) {
  const isCompleted = timelineList[index];
  const isParty = textList[index] === "Party";
  const confettiRef = useRef<ConfettiHandle>(null);

  return (
    <View style={styles.container}>
      {isParty && (
        <Confetti ref={confettiRef} count={80} originX={0.5} originY={0.5} />
      )}
      <View style={styles.row}>
        <View style={styles.flexSide} />
        <TouchableOpacity
          onPress={() => {
            if (isCompleted) {
              haptics.error();
            } else {
              haptics.success();
              if (isParty) {
                confettiRef.current?.play();
              }
            }
            updateList(index);
          }}
          hitSlop={getHitSlop("medium")}
          style={styles.flexCenter}
        >
          <View style={styles.card}>
            <Text type="subHeader" color={colors.black} center>
              {textList[index]}
            </Text>
            <View style={styles.checkContainer}>
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
        </TouchableOpacity>

        <View style={styles.flexSide}>
          {onNavigate && (
            <TouchableOpacity
              onPress={() => {
                haptics.soft();
                onNavigate();
              }}
              style={styles.navButton}
              hitSlop={getHitSlop("medium")}
            >
              <FontAwesome5
                name="chevron-right"
                size={18}
                color={colors.black}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...card.medium,
    ...padding.largeWidget,
    gap: 12
  },
  checkContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  completedIcon: {
    opacity: 1
  },
  container: {
    alignItems: "center"
  },
  flexCenter: {
    flex: 4
  },
  flexSide: {
    flex: 1,
    height: 40
  },
  navButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    flex: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  notCompletedIcon: {
    opacity: 0.1
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  }
});
