import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";

import { AllStackParamList } from "../../app/navigation";

interface PaywallButtonsProps {
  subscribeToProduct: () => void;
  isSubscribing?: boolean;
}

export function PaywallButtons({
  subscribeToProduct,
  isSubscribing = false
}: PaywallButtonsProps) {
  const navigation = useNavigation<StackNavigationProp<AllStackParamList>>();
  const navigateToWebView = (title: string, uri: string) => {
    (navigation as StackNavigationProp<AppStackParamList>).navigate("WebView", {
      title,
      uri
    });
  };

  return (
    <View style={styles.container}>
      <Button
        text={isSubscribing ? "Opening store..." : "Subscribe"}
        onPress={subscribeToProduct}
        color={colors.secondary}
        textColor={colors.white}
        leadingIcon="credit-card"
        disabled={isSubscribing}
        loading={isSubscribing}
      />

      <View style={styles.buttonContainer}>
        <Button
          text={`Privacy\nPolicy`}
          onPress={() =>
            navigateToWebView(
              "Privacy Policy",
              "https://app.eventfulapp.com/about/privacy-headerless"
            )
          }
          textColor={colors.white}
          color={colors.primaryTint}
          flex={1}
        />

        <Button
          text={`Terms of\nService`}
          onPress={() =>
            navigateToWebView(
              "Terms of Service",
              "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
            )
          }
          textColor={colors.white}
          color={colors.primaryTint}
          flex={1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 24
  },
  container: {
    gap: 12
  }
});
