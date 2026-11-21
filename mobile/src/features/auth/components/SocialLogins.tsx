import { StyleSheet, View } from "react-native";

import { AppleLogin } from "./AppleLogin";
import { AuthDivider } from "./AuthDivider";
import { GoogleLogin } from "./GoogleLogin";

export function SocialLogins() {
  return (
    <>
      <View style={styles.buttons}>
        <AppleLogin />
        <GoogleLogin />
      </View>
      <AuthDivider label="Or with email" />
    </>
  );
}

const styles = StyleSheet.create({
  buttons: {
    gap: 10
  }
});
