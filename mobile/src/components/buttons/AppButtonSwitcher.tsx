import { memo, useCallback, useEffect, useMemo, useRef } from "react";

import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { useAppDimensions } from "@/hooks/useAppDimensions";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

interface AppButtonSwitcherProps {
  selections: string[];
  selectionValues?: string[] | null;
  selectedButton: string;
  setSelectedButton: (selectedButton: string) => void;
  pressColor?: string;
  nonPressColor?: string;
  disabled?: boolean;
  onChange?: (selectedButton: string) => void;
}

export const AppButtonSwitcher = memo(function AppButtonSwitcher({
  selections,
  selectionValues = null,
  selectedButton,
  setSelectedButton,
  pressColor = colors.secondary,
  nonPressColor = colors.primaryTint,
  disabled = false,
  onChange = () => {}
}: AppButtonSwitcherProps) {
  const animationRef = useRef(new Animated.Value(0));
  const width = useAppDimensions().screenWidth;
  const selectionCount = selections.length || 1;

  const selectedButtonIndex = useMemo(
    () => selections.indexOf(selectedButton),
    [selections, selectedButton]
  );

  const handlePress = useCallback(
    (title: string) => {
      haptics.soft();
      setSelectedButton(title);

      if (onChange) {
        onChange(title);
      }
    },
    [onChange, setSelectedButton]
  );

  useEffect(() => {
    if (selectedButton && selectedButtonIndex >= 0) {
      Animated.timing(animationRef.current, {
        toValue: selectedButtonIndex * (width / selectionCount),
        duration: 200,
        useNativeDriver: false
      }).start();
    }
  }, [selectedButton, selectedButtonIndex, selectionCount, width]);

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.buttonRow}>
        {selections.map((title, index) => (
          <TouchableOpacity
            key={`selection-${title}-${index}`}
            onPress={() => handlePress(title)}
            style={styles.button}
            disabled={disabled}
            hitSlop={getHitSlop("medium")}
          >
            <Text
              type="subHeader"
              color={index === selectedButtonIndex ? pressColor : nonPressColor}
              style={styles.buttonText}
            >
              {title}
            </Text>
            {selectionValues && (
              <Text
                type="body"
                color={
                  index === selectedButtonIndex ? pressColor : nonPressColor
                }
                style={styles.buttonText}
              >
                {selectionValues[index]}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.animatedLineContainer}>
        <Animated.View
          style={[
            styles.animatedLine,
            {
              backgroundColor: pressColor,
              transform: [{ translateX: animationRef.current }],
              width: width / selectionCount
            }
          ]}
        />
        <View style={styles.bottomLine} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  animatedLine: {
    height: 2
  },
  animatedLineContainer: {
    marginTop: 6,
    width: "100%"
  },
  bottomLine: {
    backgroundColor: colors.lightGray,
    height: 1,
    width: "100%"
  },
  button: {
    flex: 1
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 12
  },
  buttonText: {
    textAlign: "center"
  },
  container: {
    opacity: 1
  },
  disabled: {
    opacity: 0.5
  }
});
