import { useEffect, useRef } from "react";

import { Animated, Image, StyleSheet, View } from "react-native";

import { Button } from "@/components/buttons/Button";
import { Text } from "@/components/text/Text";
import { Background } from "@/components/views/Background";
import { colors } from "@/styles/colors";
import { AppError } from "@/utils/error";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";

import { openAppStore } from "../utils/update";

export function UpdateScreen() {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    log("UpdateScreen: Starting animation", "info");

    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }),
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      })
    ]).start((finished) => {
      if (finished) {
        log("UpdateScreen: Animation completed successfully", "info");
      } else {
        log("UpdateScreen: Animation was cancelled", "warn");
      }
    });
  }, [scaleValue, fadeValue]);

  const handleUpdateNow = async () => {
    haptics.soft();
    try {
      await openAppStore();
    } catch (error) {
      new AppError(error, "Error opening app store", true);
    }
  };

  return (
    <Background>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleValue }],
              opacity: fadeValue
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require("@/assets/icons/update.png")}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>

          <Text type="header" color={colors.white}>
            Update Required
          </Text>

          <Text type="subHeader" color={colors.white}>
            A new version of Eventful is available
          </Text>

          <Text type="body" color={colors.white}>
            Please update to the latest version to continue using all features
            and to ensure you have the best experience.
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              text="Update Now"
              onPress={handleUpdateNow}
              color={colors.secondary}
              textColor={colors.white}
            />
          </View>
        </Animated.View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom: 12,
    width: "80%"
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%"
  },
  icon: {
    height: 150,
    width: 150
  },
  iconContainer: {
    marginBottom: 24
  }
});
