import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { Subscription } from "@/types/Subscription";

interface SubscriptionButtonProps {
  subscription: Subscription;
  selectedSubscription: Subscription;
  setSelectedSubscription: (subscription: Subscription) => void;
}

export function SubscriptionButton({
  subscription,
  selectedSubscription,
  setSelectedSubscription
}: SubscriptionButtonProps) {
  const borderColor =
    selectedSubscription.id === subscription.id
      ? colors.secondary
      : colors.lightGray;

  return (
    <TouchableOpacity
      onPress={() => {
        setSelectedSubscription(subscription);
      }}
      style={styles.container}
      hitSlop={getHitSlop("large")}
    >
      <View
        style={[
          styles.button,
          {
            borderColor,
            backgroundColor: colors.white
          }
        ]}
      >
        <Text type="header" color={colors.black} style={styles.titleText}>
          {subscription.title}
        </Text>
        <Text type="body" color={colors.black} style={styles.priceText}>
          {subscription.priceString}
        </Text>
        <Text
          type="subHeader"
          color={colors.primaryTint}
          style={styles.descriptionText}
        >
          {subscription.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    ...padding.largeWidget,
    alignItems: "flex-start",
    borderWidth: 4,
    flex: 1,
    justifyContent: "center"
  },
  container: {
    flex: 1
  },
  descriptionText: {
    textAlign: "center"
  },
  priceText: {
    textAlign: "left"
  },
  titleText: {
    textAlign: "center"
  }
});
