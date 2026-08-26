import { Image, Platform, StyleSheet, View } from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Background } from "@/components/views/Background";
import { Button } from "@/design-system/components/Button";
import { Text } from "@/design-system/components/Text";
import { TextButton } from "@/design-system/components/TextButton";
import { colors } from "@/design-system/tokens/colors";
import {
  globalStyles,
  useSafeAreaStyles
} from "@/design-system/tokens/globalStyles";
import { AuthStackParamList } from "@/features/app/navigationTypes";
import { log } from "@/utils/logging";

import { AppleLogin } from "../components/AppleLogin";
import { GoogleLogin } from "../components/GoogleLogin";

interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
}

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const handleSignIn = () => {
    log("Navigation: Sign In", "info");
    navigation.navigate("SignIn", { email: "", password: "" });
  };

  const handleSignUp = () => {
    log("Navigation: Sign Up", "info");
    navigation.navigate("SignUp");
  };

  return (
    <View style={globalStyles.container}>
      <Background page="Welcome" image>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoBackground,
              { marginTop: useSafeAreaStyles().safeArea.paddingTop }
            ]}
          >
            <Image
              source={require("@/assets/logos/eventful-logo.png")}
              style={styles.logo}
            />
          </View>
        </View>
        <View style={styles.flexTwo} />
        <View style={styles.bottomContainer}>
          <View style={styles.textContent}>
            <Text type="header">Welcome</Text>
            <Text type="body" color={colors.gray}>
              Sign in to access your account, or sign up to get started.
            </Text>
          </View>

          <Button
            text="Email"
            onPress={handleSignUp}
            color={colors.primary}
            textColor={colors.white}
            icon="envelope"
          />

          {Platform.OS === "ios" && <AppleLogin />}
          <GoogleLogin />

          <View style={styles.orContainer}>
            <Text type="body" color={colors.primary}>
              Already have an account?
            </Text>

            <TextButton
              text="Sign in"
              textColor={colors.primary}
              textAlign="center"
              type="subHeader"
              onPress={handleSignIn}
            />
          </View>
        </View>
      </Background>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 3,
    gap: 12,
    padding: 32
  },
  flexTwo: {
    flex: 2
  },
  logo: {
    height: 60,
    width: 60
  },
  logoBackground: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 6
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 15
  },
  orContainer: {
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
    marginTop: 12
  },
  textContent: {
    gap: 8
  }
});
