import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

import { PaywallFeature } from "./PaywallFeature";

interface PaywallFeaturesProps {
  selectedSubscriptionType: string;
}

export function PaywallFeatures({
  selectedSubscriptionType
}: PaywallFeaturesProps) {
  return (
    <View style={styles.container}>
      <Text type="header" color={colors.black} style={styles.title}>
        Features
      </Text>

      {selectedSubscriptionType === "Photo Booth" && (
        <>
          <PaywallFeature
            icon="image"
            description="Create memorable photos with your guests using our photo booth"
          />
          <PaywallFeature
            icon="camera"
            description="Save and share your photos with friends and family"
          />
        </>
      )}

      {selectedSubscriptionType === "Premium" && (
        <>
          <PaywallFeature
            icon="plus"
            description="All features in the Photo Booth Subscription"
          />
          <PaywallFeature
            icon="list-ul"
            description="Create custom food and drink lists for your events"
          />
          <PaywallFeature
            icon="heart"
            description="Remove the Eventful watermark from your photos"
          />
          <PaywallFeature
            icon="credit-card"
            description="Budget your event with our financial tools"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingBottom: 12,
    paddingHorizontal: 24
  },
  title: {
    marginTop: 12
  }
});
