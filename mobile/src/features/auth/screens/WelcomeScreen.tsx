import { Image, ImageBackground, StyleSheet, View } from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { AuthStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { TextButton } from "@/design-system/components/buttons/TextButton";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

import { AppleLogin } from "../components/AppleLogin";
import { GoogleLogin } from "../components/GoogleLogin";

interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, "Welcome">;
}

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const { safeArea } = useSafeAreaStyles();

  const handleSignIn = () => {
    navigation.navigate("SignIn", { email: "", password: "" });
  };

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/backgrounds/welcome-background.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <View style={styles.logoContainer}>
          <View
            style={[styles.logoBackground, { marginTop: safeArea.paddingTop }]}
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
            onPress={handleSignIn}
            color={colors.primary}
            textColor={colors.white}
            leadingIcon="envelope"
          />

          <AppleLogin />
          <GoogleLogin />

          <View style={styles.orContainer}>
            <Text type="body" color={colors.primary}>
              Don&apos;t have an account?
            </Text>

            <TextButton
              text="Sign up"
              textColor={colors.primary}
              textAlign="center"
              type="subHeader"
              onPress={handleSignUp}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  bottomContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    flex: 3,
    gap: 12,
    padding: 32
  },
  container: {
    flex: 1
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
