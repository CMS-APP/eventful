import { useDispatch } from "react-redux";

import { useCallback, useEffect, useRef, useState } from "react";

import { Alert } from "react-native";

import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { dataInit } from "@/app/init/data";
import { AuthStackParamList, navigationRef } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { TextButton } from "@/design-system/components/buttons/TextButton";
import { colors } from "@/design-system/tokens/colors";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { AuthSwitchLink } from "@/features/auth/components/AuthSwitchLink";
import { SocialLogins } from "@/features/auth/components/SocialLogins";
import { SIGN_IN_ERROR_DETAILS } from "@/features/auth/signInErrors";
import { handleSignIn } from "@/services/firebase/auth";
import { sendVerificationEmail } from "@/services/firebase/backend";
import { showOptionsAlert } from "@/utils/alertModal";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { emailValid } from "@/utils/validation";

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

  useEffect(() => {
    emailRef.current = email;
    passwordRef.current = password;
  }, [email, password]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSigningIn, setIsSigningIn] = useState(false);

  const dispatch = useDispatch();

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Please enter an email address.";
    } else if (!emailValid(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
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
    navigation.navigate("ForgotPassword");
  };

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
    } catch (error) {
      log(`Error Sending Email: ${error}`, "error");
      showErrorToast("Error Sending Email");
      Alert.alert(
        "Error",
        "We encountered an issue sending the verification email. Please try again later."
      );
    }
  }, []);

  const emailVerificationAlert = useCallback(
    (user: any) => {
      showOptionsAlert(
        "Email Not Verified",
        "Your email has not been verified. Would you like us to send you a verification email?",
        [
          { text: "No", style: "cancel" },
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
      let currentEmail = emailRef.current.trim();
      let currentPassword = passwordRef.current;

      if (devEmail && devPassword) {
        currentEmail = devEmail;
        currentPassword = devPassword;
      } else if (!validateForm()) {
        return;
      }

      setIsSigningIn(true);
      try {
        const user = await handleSignIn(currentEmail, currentPassword);

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
          const code = (error as { code?: string }).code;
          const detail = code ? SIGN_IN_ERROR_DETAILS[code] : undefined;

          if (detail) {
            setErrors({ [detail.field]: detail.message });
          } else {
            log(`Error Logging In: ${error}`, "error");
            showErrorToast("Error Logging In");
          }
        }
      } finally {
        setIsSigningIn(false);
      }
    },
    [validateForm, dispatch, emailVerificationAlert]
  );

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your account"
      footer={
        <AuthSwitchLink
          prompt="New to Eventful?"
          action="Sign up"
          onPress={handleSignUp}
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

      <AuthInput
        label="Password"
        placeholder="Your password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={() => signIn()}
        secure
        error={errors.password}
      />

      <TextButton
        type="body"
        onPress={handleForgotPassword}
        textAlign="right"
        textColor={colors.primary}
        text="Forgot Password?"
      />

      <Button
        text="Sign In"
        onPress={signIn}
        color={colors.primary}
        textColor={colors.white}
        loading={isSigningIn}
        disabled={isSigningIn || !email.trim() || !password}
      />
    </AuthLayout>
  );
}
