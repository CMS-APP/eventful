import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEffect, useMemo, useRef } from "react";

import {
  Animated,
  Platform,
  StyleSheet,
  View,
  type ViewStyle
} from "react-native";

import { FontAwesome6 } from "@expo/vector-icons";

import {
  type ToastType,
  toastColors,
  toastIcons
} from "@/app/context/toast/const";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";

type ToastProps = {
  message: string;
  type: ToastType;
  visible: boolean;
};

export function Toast({ message, type, visible }: ToastProps) {
  const animation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(animation, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true
    }).start();
  }, [animation, visible]);

  const containerStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      transform: [
        {
          translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [-(100 + insets.top), 0]
          })
        }
      ],
      opacity: animation
    }),
    [animation, insets.top]
  );

  const paddingTop = insets.top + (Platform.OS === "android" ? 12 : 0);

  return (
    <Animated.View
      style={[styles.overlay, { paddingTop }, containerStyle]}
      pointerEvents="none"
    >
      <View style={[styles.toastLine, { backgroundColor: toastColors[type] }]}>
        <View style={styles.icon}>
          <FontAwesome6
            name={toastIcons[type]}
            size={14}
            color={colors.white}
          />
        </View>

        {message ? (
          <View style={styles.messageWrapper}>
            <Text type="body" color={colors.white}>
              {message}
            </Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  icon: {
    alignItems: "center",
    flexShrink: 0,
    justifyContent: "center",
    width: 16
  },
  messageWrapper: {
    flexShrink: 1
  },
  overlay: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1000
  },
  toastLine: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    maxWidth: "90%",
    paddingHorizontal: 14,
    paddingVertical: 10
  }
});
