import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Button } from "@/components/buttons/Button";
import { AppStackParamList } from "@/features/app/navigationTypes";
import { colors } from "@/styles/colors";

import { AllStackParamList } from "../navigationTypes";

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
        icon="credit-card"
        disabled={isSubscribing}
        pulsating={true}
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
