import { getIdToken, reload } from "@react-native-firebase/auth";
import { Timestamp } from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { useDispatch, useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { FIREBASE_AUTH } from "@/app/init/firebase";
import { OnboardingStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { API_COLLECTIONS } from "@/services/api/constants";
import { createDocument } from "@/services/api/create";
import {
  checkUsernameExists,
  convertTimestampsToMillis,
  createUserInfo
} from "@/services/firebase/user";
import { UserState, setUserData } from "@/store/UserSlice";
import { User } from "@/types/User";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { capitalize, checkNames, checkUsernameValid } from "@/utils/validation";

import { OnboardingLayout } from "../components/OnboardingLayout";
import { getLoginNames } from "../utils";

interface OnboardingNameInputScreenProps {
  navigation: StackNavigationProp<OnboardingStackParamList>;
}

export function OnboardingNameInputScreen({
  navigation
}: OnboardingNameInputScreenProps) {
  const email = useSelector((state: UserState) => state.email);
  const userId = useSelector((state: UserState) => state.uid);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [helperText, setHelperText] = useState("");
  const [editable, setEditable] = useState(true);
  const dispatch = useDispatch();

  async function handleBack() {
    navigation.goBack();
  }

  const handleNext = useCallback(async () => {
    try {
      const first = firstName.trim();
      const last = lastName.trim();
      const user = username.trim();

      if (!checkNames(first, last, user)) {
        return;
      }

      try {
        if (await checkUsernameExists(user.toLowerCase())) {
          setUsernameValid(false);
          setHelperText("Username already exists.");
          return;
        }
      } catch (error) {
        Sentry.captureMessage("Username validation failed", "error");
        throw error;
      }

      const currentUser = FIREBASE_AUTH.currentUser;
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }
      await reload(currentUser);
      await getIdToken(currentUser, true);

      const date = Timestamp.fromDate(new Date());
      const data = {
        uid: userId,
        firstName: capitalize(first),
        lastName: capitalize(last),
        name: capitalize(first) + " " + capitalize(last),
        searchName: (first + " " + last).toLowerCase(),
        username: user.toLowerCase(),
        email: email,
        usernameCreateDate: date,
        usernameUpdateDate: date
      };

      await createUserInfo(userId, data as User);
      const dataWithMillis = convertTimestampsToMillis(data as User);
      dispatch(setUserData(dataWithMillis));
      navigation.navigate("OnboardingNotifications");
    } catch (error) {
      log(`Error Creating Account: ${error}`, "error");
      showErrorToast("Error Creating Account");
    }
  }, [firstName, lastName, username, userId, dispatch, navigation, email]);

  const [prevUsername, setPrevUsername] = useState(username);
  if (username !== prevUsername) {
    setPrevUsername(username);
    const { valid, helperText } = checkUsernameValid(username);
    if (!valid) {
      setUsernameValid(false);
      setHelperText(helperText);
    }
  }

  useEffect(() => {
    const { valid } = checkUsernameValid(username);
    if (!valid) return;

    (async () => {
      try {
        if (await checkUsernameExists(username.trim().toLowerCase())) {
          setUsernameValid(false);
          setHelperText("Username already exists.");
        } else {
          setUsernameValid(true);
          setHelperText("Username Available");
        }
      } catch (error) {
        const errorMessage = "Username validation failed";
        Sentry.captureMessage(errorMessage, "error");
        await createDocument(
          {
            type: "username-validation-failed",
            message: errorMessage,
            context: "OnboardingNameInputScreen",
            uid: userId ?? null,
            email: email ?? null,
            username: username.trim().toLowerCase(),
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date()
          },
          API_COLLECTIONS.FEEDBACK
        );
        setUsernameValid(false);
        setHelperText(
          "Couldn't validate username right now. Please try again."
        );
      }
    })();
  }, [username, email, userId]);

  useEffect(() => {
    (async () => {
      const loginNames = await getLoginNames();
      if (loginNames) {
        if (loginNames.type === "apple") {
          setEditable(false);
        }
        setFirstName(loginNames?.firstName);
        setLastName(loginNames?.lastName || "");
      }
    })();
  }, []);

  const statusColor = usernameValid ? colors.primary : colors.red;

  return (
    <OnboardingLayout
      step={2}
      onBack={handleBack}
      title="Make it yours"
      subtitle="This is how friends find you"
    >
      <AuthInput
        label="First name"
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        editable={editable}
      />

      <AuthInput
        label="Last name"
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
        autoComplete="family-name"
        textContentType="familyName"
        editable={editable}
      />

      <View style={styles.usernameContainer}>
        <AuthInput
          label="Username"
          placeholder="username"
          prefix="@"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoComplete="username"
          textContentType="username"
        />
        {helperText ? (
          <View style={styles.status}>
            <FontAwesome5
              name={usernameValid ? "check-circle" : "times-circle"}
              size={12}
              color={statusColor}
            />
            <Text type="caption" color={statusColor} style={styles.statusText}>
              {helperText}
            </Text>
          </View>
        ) : (
          <Text type="caption" color={colors.primaryTint3}>
            Letters, numbers, dots, dashes and underscores
          </Text>
        )}
      </View>

      <Button
        text="Continue"
        color={colors.primary}
        textColor={colors.white}
        onPress={handleNext}
        leadingIcon="arrow-right"
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  status: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  statusText: {
    flex: 1
  },
  usernameContainer: {
    gap: 6
  }
});
