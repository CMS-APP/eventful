import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { globalStyles } from "@/design-system/tokens/globalStyles";
import { Subscription } from "@/types/Subscription";
import { getHitSlop } from "@/utils/hitSlop";

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
            backgroundColor: colors.lightGray
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
    ...globalStyles.largeWidget,
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
