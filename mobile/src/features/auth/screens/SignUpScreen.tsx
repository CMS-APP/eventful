import { useCallback, useState } from "react";

import { Alert, LayoutChangeEvent, StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  ILoadingModalContext,
  useLoadingModal
} from "@/app/context/loading/LoadingModalContext";
import { AuthStackParamList } from "@/app/navigation";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { Button } from "@/design-system/components/buttons/Button";
import { TextButton } from "@/design-system/components/buttons/TextButton";
import { Input } from "@/design-system/components/inputs/Input";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { handleSignUp } from "@/services/firebase/auth";
import { sendVerificationEmail } from "@/services/firebase/backend";
import { FormErrors } from "@/types/FormErrors";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { emailValid, passwordValid } from "@/utils/validation";

import { Header } from "../components/Header";
import { HeaderArcs } from "../components/HeaderArcs";
import { formStyles } from "../styles/formStyles";

type SignUpScreenProps = NativeStackScreenProps<AuthStackParamList, "SignUp">;

export function SignUpScreen({ navigation }: SignUpScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [headerHeight, setHeaderHeight] = useState(0);

  const { setLoading } = useLoadingModal() as ILoadingModalContext;

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!emailValid(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!passwordValid(password)) {
      newErrors.password =
        "Password must be at least 8 characters and contain one number, letter, and special character.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, confirmPassword]);

  const handleSignIn = useCallback(() => {
    navigation.replace("SignIn", { email: "", password: "" });
  }, [navigation]);

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);

  const signUp = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const user = await handleSignUp(email, password);
      if (typeof user === "string") {
        setErrors({ email: user });
        return;
      }

      Alert.alert(
        "Account Created",
        "Check your email for a verification link to activate your account."
      );

      navigation.replace("SignIn", { email, password });
      sendVerificationEmail(user as any);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("auth/email-already-in-use")) {
          setErrors({ email: "Email already in use." });
        } else {
          log(`Error Signing Up: ${error}`, "error");
          showErrorToast("Error Signing Up");
          Alert.alert(
            "Error",
            "An unexpected error occurred. Please try again."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [email, password, validateForm, setLoading, navigation]);

  return (
    <View style={styles.container}>
      <Header title="Sign Up" onLayout={handleHeaderLayout} />
      <HeaderArcs headerHeight={headerHeight} />

      <KeyboardScrollView
        tabBarPresent={false}
        handleScroll={() => {}}
        _handleScroll={() => {}}
      >
        <View style={formStyles.formContainer}>
          <View style={styles.inputContainer}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              backgroundColor={colors.lightGray}
              textColor={colors.black}
            />

            {errors.email && (
              <Text type="body" color="red">
                {errors.email}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              password
              backgroundColor={colors.lightGray}
              textColor={colors.black}
            />

            {errors.password && (
              <Text type="body" color="red">
                {errors.password}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              password
              backgroundColor={colors.lightGray}
              textColor={colors.black}
            />

            {errors.confirmPassword && (
              <Text type="body" color="red">
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          <Button
            text="Sign Up"
            color={colors.primary}
            textColor={colors.white}
            onPress={signUp}
            leadingIcon="user-plus"
          />

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
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  inputContainer: {
    gap: 4
  },
  orContainer: {
    alignItems: "center",
    gap: 4,
    marginTop: 12
  }
});
