import React, { useEffect, useRef } from "react";

import {
  Animated,
  Easing,
  Keyboard,
  KeyboardEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet
} from "react-native";

import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { colors } from "@/design-system/tokens/colors";

export function KeyboardScrollView({
  children,
  handleScroll,
  _handleScroll,
  tabBarPresent,
  backgroundColor = colors.white,
  paddingBottom = 12
}: {
  children: React.ReactNode;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  _handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  tabBarPresent: boolean;
  backgroundColor?: string;
  paddingBottom?: number;
}) {
  const customEasing = Easing.bezier(0.25, 0.1, 0.25, 1);
  const keyboardMarginBottom = useRef(new Animated.Value(0)).current;
  const safeArea = useSafeAreaStyles().safeArea;
  const tabBarHeight = 48;
  const height = tabBarHeight + safeArea.paddingBottom;

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    handleScroll?.(event);
    _handleScroll?.(event);
  }

  function calculateHeight(event: KeyboardEvent) {
    const eventHeight = event.endCoordinates.height;
    if (!tabBarPresent) {
      return eventHeight;
    } else if (Platform.OS === "ios") {
      return eventHeight - height;
    } else if (Platform.OS === "android") {
      return eventHeight - tabBarHeight;
    }

    return 0;
  }

  function calculateMarginBottom() {
    if (tabBarPresent) {
      return height;
    } else if (Platform.OS === "android") {
      return safeArea.paddingBottom;
    } else {
      return 0;
    }
  }

  function showAnimation(event: KeyboardEvent) {
    Animated.timing(keyboardMarginBottom, {
      toValue: calculateHeight(event),
      duration: 300,
      easing: customEasing,
      useNativeDriver: false
    }).start();
  }

  function hideAnimation() {
    Animated.timing(keyboardMarginBottom, {
      toValue: 0,
      duration: 300,
      easing: customEasing,
      useNativeDriver: false
    }).start();
  }

  useEffect(() => {
    if (Platform.OS === "ios") {
      const keyboardWillShowListener = Keyboard.addListener(
        "keyboardWillShow",
        (event) => {
          showAnimation(event);
        }
      );
      const keyboardWillHideListener = Keyboard.addListener(
        "keyboardWillHide",
        () => {
          hideAnimation();
        }
      );

      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      };
    }

    if (Platform.OS === "android") {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        (event) => {
          showAnimation(event);
        }
      );

      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          hideAnimation();
        }
      );
      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, [customEasing, keyboardMarginBottom]);

  const scrollViewStyle = {
    marginBottom: calculateMarginBottom(),
    backgroundColor: backgroundColor
  };

  const contentContainerStyle = {
    ...styles.contentContainer,
    backgroundColor: backgroundColor,
    paddingBottom: paddingBottom
  };

  return (
    <ScrollView
      onScroll={onScroll}
      style={scrollViewStyle}
      scrollEventThrottle={16}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View
        style={[contentContainerStyle, { marginBottom: keyboardMarginBottom }]}
      >
        {children}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1
  }
});
