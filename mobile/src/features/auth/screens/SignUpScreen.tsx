import { updateProfile } from "@react-native-firebase/auth";

import { useCallback, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { StepDots } from "@/design-system/components/feedback/StepDots";
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

const TERMS_URL =
  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
const PRIVACY_URL = "https://app.eventfulapp.com/about/privacy-headerless";

interface SignUpErrors {
  name?: string;
  email?: string;
}

type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
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

  const handleContinue = useCallback(() => {
    const newErrors: SignUpErrors = {};

    if (!name.trim()) {
      newErrors.name = "Add your name";
    }

    if (!emailValid(email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  }, [name, email]);

  const canCreateAccount = passwordValid(password) && acceptedTerms;

  const signUp = useCallback(async () => {
    if (!canCreateAccount) {
      return;
    }

    const trimmedEmail = email.trim();

    setIsSigningUp(true);
    try {
      const user = await handleSignUp(trimmedEmail, password);
      if (typeof user === "string") {
        setErrors({ email: user });
        setStep(1);
        return;
      }

      await updateProfile(user, { displayName: name.trim() });

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
  }, [canCreateAccount, email, password, name, navigation]);

  return (
    <AuthLayout
      title="Create account"
      subtitle="Plan with ease, connect with joy"
      onBack={step === 2 ? () => setStep(1) : undefined}
      footer={
        <AuthSwitchLink
          prompt="Already have an account?"
          action="Sign in"
          onPress={handleSignIn}
        />
      }
    >
      <StepDots step={step} total={2} />

      {step === 1 ? (
        <>
          <SocialLogins />

          <AuthInput
            label="Full name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            error={errors.name}
          />

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
            onSubmitEditing={handleContinue}
            error={errors.email}
          />
        </>
      ) : (
        <>
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
        </>
      )}

      <Button
        text={step === 1 ? "Continue" : "Create Account"}
        onPress={step === 1 ? handleContinue : signUp}
        color={colors.primary}
        textColor={colors.white}
        loading={isSigningUp}
        disabled={isSigningUp || (step === 2 && !canCreateAccount)}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: "underline"
  }
});
