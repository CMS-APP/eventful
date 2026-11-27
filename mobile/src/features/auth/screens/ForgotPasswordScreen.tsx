import { useCallback, useState } from "react";

import { Alert } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { forgotPassword } from "@/services/firebase/backend";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { emailValid } from "@/utils/validation";

import { AuthInput } from "../components/AuthInput";
import { AuthLayout } from "../components/AuthLayout";
import { ResetLinkSent } from "../components/ResetLinkSent";

type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "ForgotPassword"
>;

export function ForgotPasswordScreen({
  navigation
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resent, setResent] = useState(false);

  const sendResetLink = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!emailValid(trimmedEmail)) {
      setError("Enter a valid email");
      return false;
    }
    setError(undefined);
    setLoading(true);

    try {
      const response = await forgotPassword(trimmedEmail);
      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }
      return true;
    } catch (error) {
      log(`Error requesting password reset: ${error}`, "error");
      showErrorToast("Error Sending Reset Link");
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleSubmit = useCallback(async () => {
    if (sent) {
      navigation.goBack();
      return;
    }
    if (await sendResetLink()) {
      setSent(true);
      setResent(false);
    }
  }, [sent, sendResetLink, navigation]);

  const handleResend = useCallback(async () => {
    if (loading) return;
    if (await sendResetLink()) {
      setResent(true);
    }
  }, [loading, sendResetLink]);

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Plan with ease, connect with joy"
      onBack={navigation.goBack}
      footer={
        <Button
          text={sent ? "Back to Sign In" : "Send Reset Link"}
          color={colors.primary}
          textColor={colors.white}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
        />
      }
    >
      {sent ? (
        <ResetLinkSent
          email={email.trim()}
          resent={resent}
          sending={loading}
          onResend={handleResend}
        />
      ) : (
        <>
          <Text type="body" color={colors.darkGray} center>
            Enter your email and we&apos;ll send you a link to reset your
            password.
          </Text>

          <AuthInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            error={error}
          />
        </>
      )}
    </AuthLayout>
  );
}
