import { useCallback, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { handleSignUp } from "@/services/firebase/auth";
import { sendVerificationEmail } from "@/services/firebase/backend";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { emailValid, passwordValid } from "@/utils/validation";

import { AuthCheckbox } from "../components/AuthCheckbox";
import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { AuthSwitchLink } from "../components/AuthSwitchLink";
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter";
import { SocialLogins } from "../components/SocialLogins";
import { PRIVACY_URL, TERMS_URL } from "../legalLinks";

interface SignUpErrors {
  email?: string;
}

type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleSignIn = useCallback(() => {
    navigation.replace("SignIn", {});
  }, [navigation]);

  const openWebView = useCallback(
    (title: string, uri: string) => {
      navigation.getParent()?.navigate("WebView", { title, uri });
    },
    [navigation]
  );

  const canCreateAccount = passwordValid(password) && acceptedTerms;

  const signUp = useCallback(async () => {
    if (!canCreateAccount) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!emailValid(trimmedEmail)) {
      setErrors({ email: "Enter a valid email" });
      return;
    }

    setErrors({});
    setIsSigningUp(true);
    try {
      const user = await handleSignUp(trimmedEmail, password);
      if (typeof user === "string") {
        setErrors({ email: user });
        return;
      }

      Alert.alert(
        "Account Created",
        "Check your email for a verification link to activate your account."
      );

      navigation.replace("SignIn", { email: trimmedEmail, password });
      sendVerificationEmail(user as any);
    } catch (error) {
      log(`Error Signing Up: ${error}`, "error");
      showErrorToast("Error Signing Up");
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  }, [canCreateAccount, email, password, navigation]);

  return (
    <AuthLayout
      title="Create account"
      subtitle="Plan with ease, connect with joy"
      footer={
        <AuthSwitchLink
          prompt="Already have an account?"
          action="Sign in"
          onPress={handleSignIn}
        />
      }
    >
      <SocialLogins />

      <AuthInput
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        error={errors.email}
      />

      <View>
        <AuthInput
          label="Password"
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          secure
        />
        <PasswordStrengthMeter password={password} />
      </View>

      <AuthCheckbox
        checked={acceptedTerms}
        onChange={() => setAcceptedTerms(!acceptedTerms)}
      >
        <Text type="caption" color={colors.darkGray}>
          I agree to the{" "}
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
        </Text>
      </AuthCheckbox>

      <Button
        text="Create Account"
        onPress={signUp}
        color={colors.primary}
        textColor={colors.white}
        loading={isSigningUp}
        disabled={isSigningUp || !canCreateAccount}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: "underline"
  }
});
