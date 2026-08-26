import { useEffect, useRef } from "react";

import {
  Animated,
  Image,
  Linking,
  Platform,
  StyleSheet,
  View
} from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Button } from "@/design-system/components/Button";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { useAppDimensions } from "@/design-system/tokens/globalStyles";
import { AppStackParamList } from "@/features/app/navigationTypes";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";

import { AllStackParamList } from "../navigationTypes";

interface SubscriptionCelebrationScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<AppStackParamList, "SubscriptionCelebration">;
}

export function SubscriptionCelebrationScreen({
  navigation,
  route
}: SubscriptionCelebrationScreenProps) {
  const type = (route.params as { type: string })?.type || "premium";
  const width = useAppDimensions().screenWidth;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    log("SubscriptionCelebrationScreen: Starting animation", "info");

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
        log(
          "SubscriptionCelebrationScreen: Animation completed successfully",
          "info"
        );
        haptics.success();
      } else {
        log("SubscriptionCelebrationScreen: Animation was cancelled", "warn");
      }
    });
  }, [scaleValue, fadeValue]);

  async function handleLeaveReview() {
    if (Platform.OS === "ios") {
      const itunesItemId = 6449842590;

      const canOpen = await Linking.canOpenURL(
        `https://apps.apple.com/app/id${itunesItemId}?action=write-review`
      );

      if (canOpen) {
        Linking.openURL(
          `https://apps.apple.com/app/id${itunesItemId}?action=write-review`
        );
      } else {
        Linking.openURL(`https://apps.apple.com/app/id${itunesItemId}`);
      }
    } else {
      const slug = "com.hostinghappily.app";
      Linking.openURL(
        `https://play.google.com/store/apps/details?id=${slug}&showAllReviews=true`
      );
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeValue,
            transform: [{ scale: scaleValue }]
          }
        ]}
      >
        <View style={styles.confettiContainer}>
          <Image
            source={require("@/assets/logos/eventful-confetti.png")}
            style={[
              styles.confettiImage,
              { width: width * 0.6, height: width * 0.6 }
            ]}
            resizeMode="contain"
          />
        </View>

        <Text type="subHeader" color={colors.secondary}>
          Thank you for subscribing to
        </Text>
        <Text type="header" color={colors.white}>
          Eventful!
        </Text>
        <Text type="body" color={colors.white}>
          {type === "photoBooth"
            ? "Welcome to the photo booth experience"
            : "Welcome to the premium experience"}
        </Text>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <Button
          text="Let's get started!"
          onPress={() => {
            navigation.goBack();
          }}
          color={colors.secondary}
          textColor={colors.white}
        />

        <Button
          text="Leave a review"
          onPress={handleLeaveReview}
          color={colors.primaryTint}
          textColor={colors.white}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    gap: 12,
    paddingHorizontal: 24,
    width: "100%",
    zIndex: 2
  },
  confettiContainer: {
    borderRadius: 50,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12
  },
  confettiImage: {
    borderRadius: 50
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: "center"
  },
  contentContainer: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    paddingBottom: 20,
    paddingHorizontal: 24
  }
});
