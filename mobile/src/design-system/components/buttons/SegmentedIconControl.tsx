import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

const ICON_SIZE = 20;
const LINE_WIDTH = ICON_SIZE * 2;

interface SwitchIconButtonProps {
  icons: string[];
  selectedIcon: string;
  setSelectedIcon: (selectedIcon: string) => void;
  pressColor?: string;
  lineColor?: string;
  nonPressColor?: string;
  disabled?: boolean;
  onChange?: (selectedIcon: string) => void;
}

export const SegmentedIconControl = memo(function SwitchIconButton({
  icons,
  selectedIcon,
  setSelectedIcon,
  pressColor = colors.white,
  nonPressColor = colors.gray,
  lineColor = colors.secondary,
  disabled = false,
  onChange = () => {}
}: SwitchIconButtonProps) {
  const animationRef = useRef(new Animated.Value(0));
  const hasPositioned = useRef(false);
  const [width, setWidth] = useState(0);
  const iconCount = icons.length || 1;

  const selectedIconIndex = useMemo(
    () => icons.indexOf(selectedIcon),
    [icons, selectedIcon]
  );

  const handlePress = useCallback(
    (icon: string) => {
      haptics.soft();
      setSelectedIcon(icon);

      if (onChange) {
        onChange(icon);
      }
    },
    [onChange, setSelectedIcon]
  );

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  useEffect(() => {
    if (!width || selectedIconIndex < 0) return;

    const segmentWidth = width / iconCount;
    const toValue =
      selectedIconIndex * segmentWidth + (segmentWidth - LINE_WIDTH) / 2;

    if (!hasPositioned.current) {
      animationRef.current.setValue(toValue);
      hasPositioned.current = true;
      return;
    }

    Animated.timing(animationRef.current, {
      toValue,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [selectedIconIndex, iconCount, width]);

  return (
    <View
      style={[styles.container, disabled && styles.disabled]}
      onLayout={handleLayout}
    >
      <View style={styles.buttonRow}>
        {icons.map((icon, index) => (
          <TouchableOpacity
            key={`icon-${icon}-${index}`}
            onPress={() => handlePress(icon)}
            style={styles.button}
            disabled={disabled}
            hitSlop={getHitSlop("medium")}
          >
            <FontAwesome5
              name={icon}
              size={ICON_SIZE}
              color={index === selectedIconIndex ? pressColor : nonPressColor}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.animatedLineContainer}>
        {width > 0 && selectedIconIndex >= 0 && (
          <Animated.View
            style={[
              styles.animatedLine,
              {
                backgroundColor: lineColor,
                transform: [{ translateX: animationRef.current }]
              }
            ]}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  animatedLine: {
    height: 2,
    width: LINE_WIDTH
  },
  animatedLineContainer: {
    paddingTop: 12,
    width: "100%"
  },
  button: {
    alignItems: "center",
    flex: 1
  },
  buttonRow: {
    flexDirection: "row"
  },
  container: {
    opacity: 1,
    paddingBottom: 8
  },
  disabled: {
    opacity: 0.5
  }
});
