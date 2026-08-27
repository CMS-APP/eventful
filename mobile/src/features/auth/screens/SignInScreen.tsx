import { useDispatch } from "react-redux";

import { useCallback, useRef, useState } from "react";

import { Alert, LayoutChangeEvent, StyleSheet, View } from "react-native";

import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { useLoadingModal } from "@/app/context/loading/LoadingModalContext";
import { dataInit } from "@/app/init/data";
import { AuthStackParamList, navigationRef } from "@/app/navigation";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Text } from "@/design-system/components/Text";
import { TextButton } from "@/design-system/components/TextButton";
import { colors } from "@/design-system/tokens/colors";
import { Header } from "@/features/auth/components/Header";
import { HeaderArcs } from "@/features/auth/components/HeaderArcs";
import { formStyles } from "@/features/auth/styles/formStyles";
import { handleSignIn } from "@/services/firebase/firebaseAuth";
import { sendVerificationEmail } from "@/services/firebase/firebaseBackend";
import { showErrorToast } from "@/utils/toast";

interface FormErrors {
  email?: string;
  password?: string;
}

type SignInScreenProps = NativeStackScreenProps<AuthStackParamList, "SignIn">;

export function SignInScreen({ navigation, route }: SignInScreenProps) {
  const [email, setEmail] = useState(route?.params?.email || "");
  const [password, setPassword] = useState(route?.params?.password || "");
  const emailRef = useRef(email);
  const passwordRef = useRef(password);

  // Update refs when state changes
  emailRef.current = email;
  passwordRef.current = password;

  const [errors, setErrors] = useState<FormErrors>({});
  const [headerHeight, setHeaderHeight] = useState(0);

  const dispatch = useDispatch();
  const { setLoading } = useLoadingModal();

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = "Please enter an email address.";
    }

    if (!password) {
      newErrors.password = "Please enter a password.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSignUp = () => {
    navigation.replace("SignUp");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword", {
      title: "Forgot Password",
      uri: "https://app.eventfulapp.com/forgot-password-headerless"
    });
  };

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  }, []);

  const sendEmailVerificationAlert = useCallback(async (user: any) => {
    try {
      const result = await sendVerificationEmail(user);
      if (result.ok) {
        Alert.alert(
          "Verification Link Sent",
          "A new verification email has been sent. Please check your inbox."
        );
      } else {
        if (result.status === 429) {
          Alert.alert(
            "Too Many Requests",
            "You have sent too many verification emails. Please try again later."
          );
        } else {
          Alert.alert(
            "Error",
            "We encountered an issue sending the verification email. Please try again later."
          );
        }
      }
    } catch {
      showErrorToast("Error Sending Email");
      Alert.alert(
        "Error",
        "We encountered an issue sending the verification email. Please try again later."
      );
    }
  }, []);

  const emailVerificationAlert = useCallback(
    (user: any) => {
      Alert.alert(
        "Email Not Verified",
        "Your email has not been verified. Would you like us to send you a verification email?",
        [
          { text: "No", style: "destructive" },
          {
            text: "Send Link",
            onPress: () => {
              sendEmailVerificationAlert(user);
            }
          }
        ]
      );
    },
    [sendEmailVerificationAlert]
  );

  const signIn = useCallback(
    async (devEmail?: string, devPassword?: string) => {
      let currentEmail = emailRef.current;
      let currentPassword = passwordRef.current;

      if (devEmail && devPassword) {
        currentEmail = devEmail;
        currentPassword = devPassword;
      } else if (!validateForm()) {
        return;
      }

      setLoading(true);
      try {
        const user: any | null = await handleSignIn(
          currentEmail,
          currentPassword
        );

        if (!user) {
          setErrors({ password: "Wrong password" });
          return;
        }

        if (!user.emailVerified) {
          emailVerificationAlert(user);
          return;
        }

        const result = await dataInit(dispatch, () => {});
        navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: result }]
          })
        );
      } catch (error) {
        if (error instanceof Error) {
          const errorMessages: Record<string, string> = {
            "auth/user-not-found": "Wrong password",
            "auth/wrong-password": "Wrong password",
            "auth/too-many-requests": "Too many requests",
            "auth/invalid-email": "Invalid email",
            "auth/user-disabled": "User disabled",
            "auth/network-request-failed": "Network request failed",
            "auth/invalid-credential": "Invalid credentials"
          };

          const errorMessage = errorMessages[error.message];

          if (errorMessage) {
            setErrors({ password: errorMessage });
          } else {
            showErrorToast("Error Logging In");
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [validateForm, setLoading, dispatch, emailVerificationAlert]
  );

  return (
    <View style={styles.container}>
      <Header title="Sign In" onLayout={handleHeaderLayout} />
      <HeaderArcs headerHeight={headerHeight} />

      <KeyboardScrollView
        tabBarPresent={false}
        handleScroll={() => {}}
        _handleScroll={() => {}}
      >
        <View style={formStyles.formContainer}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            backgroundColor={colors.lightGray}
            textColor={colors.black}
          />

          {errors.email && (
            <Text type="body" color="red">
              {errors.email}
            </Text>
          )}

          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            keyboardType="default"
            backgroundColor={colors.lightGray}
            textColor={colors.black}
            password
          />

          {errors.password && (
            <Text type="body" color="red">
              {errors.password}
            </Text>
          )}

          <TextButton
            type="body"
            onPress={handleForgotPassword}
            textAlign="left"
            textColor="black"
            text="Forgot Password?"
          />

          <Button
            text="Sign In"
            onPress={signIn}
            color={colors.primary}
            textColor={colors.white}
            leadingIcon="sign-in-alt"
          />

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
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    color: colors.white,
    flex: 1
  },
  orContainer: {
    alignItems: "center",
    gap: 4,
    marginTop: 12
  }
});
