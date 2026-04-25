import {
  GestureHandlerRootView,
  PanGestureHandler,
  State
} from "react-native-gesture-handler";

import { useCallback, useEffect, useRef } from "react";

import { Animated, Linking, StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { useSafeAreaStyles } from "@/styles/globalStyles";
import { log } from "@/utils/logging";

import { SmallButton } from "../buttons/SmallButton";

interface ErrorNotificationProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function ErrorNotification({
  message,
  visible,
  onDismiss,
  duration = 4000
}: ErrorNotificationProps) {
  const displayMessage = message?.trim() || "An unexpected error occurred";

  useEffect(() => {
    if (visible && (!message || message.trim() === "")) {
      log(
        "ErrorNotification: Received empty or undefined message: " + message,
        "warn"
      );
    }
  }, [visible, message]);
  const slideAnim = useRef(new Animated.Value(-100));
  const opacityAnim = useRef(new Animated.Value(0));
  const panAnim = useRef(new Animated.Value(0));
  const autoDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safeAreaStyles = useSafeAreaStyles();

  const dismissNotification = useCallback(() => {
    if (autoDismissTimer.current) {
      clearTimeout(autoDismissTimer.current);
      autoDismissTimer.current = null;
    }

    Animated.parallel([
      Animated.timing(slideAnim.current, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(opacityAnim.current, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => {
      onDismiss();
    });
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      panAnim.current.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim.current, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();

      autoDismissTimer.current = setTimeout(dismissNotification, duration);

      return () => {
        if (autoDismissTimer.current) {
          clearTimeout(autoDismissTimer.current);
        }
      };
    } else {
      dismissNotification();
    }
  }, [visible, duration, dismissNotification]);

  const onGestureEvent = (event: any) => {
    const { translationY } = event.nativeEvent;
    if (translationY <= 0) {
      panAnim.current.setValue(translationY);
    }
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;

      if (translationY <= 0) {
        if (translationY < -50 || velocityY < -500) {
          if (autoDismissTimer.current) {
            clearTimeout(autoDismissTimer.current);
            autoDismissTimer.current = null;
          }

          Animated.parallel([
            Animated.timing(panAnim.current, {
              toValue: -200,
              duration: 200,
              useNativeDriver: true
            }),
            Animated.timing(opacityAnim.current, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true
            })
          ]).start(() => {
            onDismiss();
          });
        } else {
          Animated.spring(panAnim.current, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8
          }).start();
        }
      }
    }
  };

  const contactSupport = () => {
    Linking.openURL("mailto:help@eventfulapp.com");
  };

  if (!visible) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <Animated.View
        style={[
          styles.container,
          {
            top: safeAreaStyles.safeArea.paddingTop + 10,
            transform: [
              { translateY: slideAnim.current },
              { translateY: panAnim.current }
            ],
            opacity: opacityAnim.current
          }
        ]}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetY={[-10, 0]}
          failOffsetX={[-50, 50]}
        >
          <Animated.View style={styles.content}>
            <View style={styles.messageContainer}>
              <FontAwesome5
                name="exclamation-circle"
                size={16}
                color={colors.white}
              />
              <Text type="subHeader" color={colors.white}>
                {displayMessage}
              </Text>
            </View>
            <Text type="body" color={colors.white} style={styles.supportText}>
              If this issue persists, please contact support.
            </Text>

            <SmallButton
              text="Contact Support"
              onPress={contactSupport}
              color={colors.white}
              textColor={colors.black}
            />
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.tertiary + "FF",
    borderRadius: 24,
    elevation: 6,
    left: 0,
    paddingHorizontal: 24,
    paddingVertical: 24,
    position: "absolute",
    right: 0,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 1000
  },
  content: {
    alignItems: "flex-start",
    flex: 1,
    gap: 6
  },
  gestureRoot: {
    left: 20,
    position: "absolute",
    right: 20,
    top: 0,
    zIndex: 1000
  },
  messageContainer: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12
  },
  supportText: {
    marginBottom: 6
  }
});
