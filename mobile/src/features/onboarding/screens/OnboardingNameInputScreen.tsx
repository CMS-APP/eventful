import { getIdToken, reload } from "@react-native-firebase/auth";
import { Timestamp } from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { useDispatch, useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { FIREBASE_AUTH } from "@/app/init/firebase";
import { OnboardingStackParamList } from "@/app/navigation";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { Input } from "@/design-system/components/inputs/Input";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { API_COLLECTIONS } from "@/services/api/constants";
import { createDocument } from "@/services/api/create";
import {
  checkUsernameExists,
  convertTimestampsToMillis,
  createUserInfo
} from "@/services/firebase/user";
import { UserState, setUserData } from "@/store/UserSlice";
import { User } from "@/types/User";
import { showErrorToast } from "@/utils/toast";
import { capitalize, checkNames, checkUsernameValid } from "@/utils/validation";

import { OnboardingButtons } from "../components/OnboardingButtons";
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

  const { paddingTop } = useSafeAreaStyles().safeArea;

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

      // Ensure the token is fresh and emailVerified is reflected
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
    } catch {
      showErrorToast("Error Creating Account");
    }
  }, [firstName, lastName, username, userId, dispatch, navigation, email]);

  const checkUsername = useCallback(async () => {
    const { valid, helperText } = checkUsernameValid(username);
    if (!valid) {
      setUsernameValid(false);
      setHelperText(helperText);
      return;
    }
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
      setHelperText("Couldn't validate username right now. Please try again.");
    }
  }, [email, userId, username]);

  async function _getLoginNames() {
    const loginNames = await getLoginNames();
    if (loginNames) {
      if (loginNames.type === "apple") {
        setEditable(false);
      }
      setFirstName(loginNames?.firstName);
      setLastName(loginNames?.lastName || "");
    }
  }

  useEffect(() => {
    checkUsername();
  }, [username, checkUsername]);

  useEffect(() => {
    _getLoginNames();
  }, []);

  return (
    <View style={styles.container}>
      <KeyboardScrollView
        tabBarPresent={false}
        backgroundColor={colors.primary}
        handleScroll={() => {}}
        _handleScroll={() => {}}
      >
        <View
          style={[
            styles.contentContainer,
            {
              marginTop: paddingTop + 20
            }
          ]}
        >
          <Text type="header" style={styles.title}>
            User Details
          </Text>

          <Input
            placeholder="First Name"
            onChangeText={(text: string) => setFirstName(text)}
            value={firstName}
            dark
            backgroundColor={colors.lightGray}
            textColor={colors.black}
            editable={editable}
          />

          <Input
            placeholder="Last Name"
            onChangeText={(text: string) => setLastName(text)}
            value={lastName}
            dark
            backgroundColor={colors.lightGray}
            textColor={colors.black}
            editable={editable}
          />

          <Input
            placeholder="Username"
            onChangeText={(text: string) => setUsername(text)}
            value={username}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            dark
            backgroundColor={colors.lightGray}
            textColor={colors.black}
          >
            {helperText && (
              <View style={styles.helperTextContainer}>
                <Text
                  type="body"
                  italic
                  color={usernameValid ? colors.green : colors.red + "CC"}
                  center
                >
                  <FontAwesome5
                    name={usernameValid ? "check" : "times"}
                    size={12}
                    color={usernameValid ? colors.green : colors.red + "CC"}
                  />{" "}
                  {helperText}
                </Text>
              </View>
            )}
          </Input>
        </View>

        <OnboardingButtons
          backText="Back"
          exit={handleBack}
          next={handleNext}
        />
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1
  },
  contentContainer: {
    backgroundColor: colors.primary,
    gap: 24,
    justifyContent: "center",
    marginBottom: 24,
    marginHorizontal: 24
  },
  helperTextContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    margin: 12
  },
  title: {
    color: colors.white,
    textAlign: "center"
  }
});
