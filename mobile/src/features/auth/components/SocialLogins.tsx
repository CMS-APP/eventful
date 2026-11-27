import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

import { PRIVACY_URL, TERMS_URL } from "../legalLinks";
import { AppleLogin } from "./AppleLogin";
import { AuthDivider } from "./AuthDivider";
import { GoogleLogin } from "./GoogleLogin";

export function SocialLogins() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  function openWebView(title: string, uri: string) {
    navigation.getParent()?.navigate("WebView", { title, uri });
  }

  return (
    <>
      <View style={styles.buttons}>
        <AppleLogin />
        <GoogleLogin />
        <Text type="caption" color={colors.darkGray} center>
          By continuing you agree to the{" "}
          <Text
            type="caption"
            color={colors.primary}
            style={styles.link}
            onPress={() => openWebView("Terms of Service", TERMS_URL)}
          >
            Terms
          </Text>{" "}
          and{" "}
          <Text
            type="caption"
            color={colors.primary}
            style={styles.link}
            onPress={() => openWebView("Privacy Policy", PRIVACY_URL)}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
      <AuthDivider label="Or with email" />
    </>
  );
}

const styles = StyleSheet.create({
  buttons: {
    gap: 10
  },
  link: {
    textDecorationLine: "underline"
  }
});
