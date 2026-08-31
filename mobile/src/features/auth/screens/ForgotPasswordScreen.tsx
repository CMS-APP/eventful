import { useCallback, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthStackParamList } from "@/app/navigation";
import { FlatHeader } from "@/components/screen/FlatHeader";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { forgotPassword } from "@/services/firebase/backend";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { emailValid } from "@/utils/validation";

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

  const handleSubmit = useCallback(async () => {
    if (!emailValid(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(undefined);
    setLoading(true);

    try {
      await forgotPassword(email);
      Alert.alert(
        "Check Your Email",
        "If your email is registered, you will receive a password reset link.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      log(`Error requesting password reset: ${error}`, "error");
      showErrorToast("Error Sending Reset Link");
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [email, navigation, setLoading]);

  return (
    <View style={styles.container}>
      <FlatHeader
        title="Forgot Password"
        dark
        backgroundColor={colors.primary}
        backAction
      />

      <KeyboardScrollView
        tabBarPresent={false}
        handleScroll={() => {}}
        _handleScroll={() => {}}
        backgroundColor={colors.primary}
      >
        <View style={styles.formContainer}>
          <Text type="body" color={colors.white}>
            Enter your email address and we will send you a link to reset your
            password.
          </Text>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              backgroundColor={colors.white}
              textColor={colors.black}
              dark
            />

            {error && (
              <Text type="body" color={colors.red}>
                {error}
              </Text>
            )}
          </View>

          <Button
            text="Send Reset Link"
            color={colors.primaryTint}
            textColor={colors.white}
            onPress={handleSubmit}
            leadingIcon="paper-plane"
            loading={loading}
          />
        </View>
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1,
    paddingTop: 24
  },
  formContainer: {
    backgroundColor: colors.primary,
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24
  },
  inputContainer: {
    gap: 4
  }
});
