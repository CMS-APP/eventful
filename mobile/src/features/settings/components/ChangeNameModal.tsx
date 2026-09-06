import { Timestamp } from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { useDispatch, useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import {
  changeHostname,
  checkUsernameExists,
  updateUserInfo
} from "@/services/firebase/user";
import {
  UserState,
  setFirstName,
  setLastName,
  setName,
  setUsername,
  setUsernameUpdateDate
} from "@/store/UserSlice";
import { parseDatabaseDate } from "@/utils/date";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";
import { checkValue as checkValueUtil } from "@/utils/validation";

interface ChangeNameModalProps {
  presentModal: boolean;
  setPresentModal: (presentModal: boolean) => void;
  type: string;
}

export function ChangeNameModal({
  presentModal,
  setPresentModal,
  type
}: ChangeNameModalProps) {
  const [newName, setNewName] = useState("");
  const [newSecondName, setNewSecondName] = useState("");
  const [usernameExists, setUsernameExists] = useState<boolean | null>(null);
  const [helperText, setHelperText] = useState("");

  const userId = useSelector((state: UserState) => state.uid);
  const name = useSelector((state: UserState) => state.name);
  const firstName = useSelector((state: UserState) => state.firstName);
  const lastName = useSelector((state: UserState) => state.lastName);
  const username = useSelector((state: UserState) => state.username);
  const usernameUpdateDate = useSelector(
    (state: UserState) => state.usernameUpdateDate
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!presentModal) return;

    if (type === "name") {
      setNewName(firstName);
      setNewSecondName(lastName);
    } else if (type === "username") {
      setNewName(username);
    }
    setUsernameExists(null);
    setHelperText("");
  }, [presentModal, type, firstName, lastName, username]);

  const usernameExistsFunc = useCallback(async (username: string) => {
    return await checkUsernameExists(username.toLowerCase());
  }, []);

  const checkNames = useCallback(async () => {
    if (type === "name") {
      const firstNameCheck = checkValueUtil(newName, "first name");
      const lastNameCheck = checkValueUtil(newSecondName, "last name");

      if (firstNameCheck?.valid === null && lastNameCheck?.valid === null) {
        setUsernameExists(null);
        setHelperText("");
      } else if (!firstNameCheck?.valid || !lastNameCheck?.valid) {
        setUsernameExists(true);
        setHelperText(firstNameCheck?.message || lastNameCheck?.message || "");
      } else {
        setUsernameExists(false);
        setHelperText("");
      }
    } else if (type === "username") {
      if (newName.toLowerCase() === username.toLowerCase()) {
        setUsernameExists(null);
        setHelperText("");
        return;
      }

      const usernameCheck = checkValueUtil(newName, "username");
      if (usernameCheck?.valid === null) {
        setUsernameExists(true);
        setHelperText("Username is required");
      } else if (!usernameCheck?.valid) {
        setUsernameExists(true);
        setHelperText(usernameCheck?.message || "");
      } else {
        try {
          if (await usernameExistsFunc(newName)) {
            setUsernameExists(true);
            setHelperText("Username already exists");
          } else {
            setUsernameExists(false);
            setHelperText("Username Available");
          }
        } catch {
          Sentry.captureMessage("Username validation failed", "error");
          setUsernameExists(true);
          setHelperText(
            "Couldn't validate username right now. Please try again."
          );
        }
      }
    }
  }, [newName, newSecondName, type, username, usernameExistsFunc]);

  useEffect(() => {
    checkNames();
  }, [newName, newSecondName, type, checkNames]);

  const changeName = useCallback(async () => {
    let data: {
      name?: string;
      firstName?: string;
      lastName?: string;
      searchName?: string;
      username?: string;
      usernameUpdateDate?: Timestamp;
    } = {};
    try {
      if (type === "name") {
        const firstName = checkValueUtil(newName, "first name");
        const lastName = checkValueUtil(newSecondName, "last name");

        if (!firstName?.valid || !lastName?.valid) {
          Alert.alert(
            "Invalid Name",
            firstName?.message || lastName?.message || ""
          );
          return;
        }

        data = {
          name: newName + " " + newSecondName,
          firstName: newName,
          lastName: newSecondName,
          searchName: newName.toLowerCase() + " " + newSecondName.toLowerCase()
        };

        if (name === data.name) {
          Alert.alert("Same Name As Before", "Please enter a different name.");
          return;
        }

        dispatch(setName(data.name));
        dispatch(setFirstName(newName));
        dispatch(setLastName(newSecondName));
        await changeHostname(userId, newName, newSecondName);
      } else if (type === "username") {
        const result = checkValueUtil(newName, "username");

        if (!result?.valid) {
          Alert.alert("Invalid Username", (result?.message as string) || "");
          return;
        }

        const normalizedUsername = newName.trim().toLowerCase();
        const usernameExists = await checkUsernameExists(normalizedUsername);

        if (usernameExists === true) {
          Alert.alert("Username Taken", "Please enter a different username.");
          return;
        }

        if (username.toLowerCase() === normalizedUsername) {
          Alert.alert(
            "Same Username As Before",
            "Please enter a different username."
          );
          return;
        }

        if (
          usernameUpdateDate !== null &&
          new Date().getTime() -
            (parseDatabaseDate(usernameUpdateDate) as number) <
            30 * 24 * 60 * 60 * 1000
        ) {
          Alert.alert(
            "Username Update Limit",
            "You can only change your username once every 30 days"
          );
          return;
        }

        const updateDate = Timestamp.fromDate(new Date());
        data = {
          username: normalizedUsername,
          usernameUpdateDate: updateDate
        };
        dispatch(setUsernameUpdateDate(updateDate.toMillis()));
        dispatch(setUsername(normalizedUsername));
      }

      await updateUserInfo(userId, data);
      setPresentModal(false);
      setNewName("");
      setNewSecondName("");
      setUsernameExists(null);
      Alert.alert("Success", `Your ${type} has been updated.`);
    } catch (error) {
      log(`Error Changing Name: ${error}`, "error");
      showErrorToast("Error Changing Name");
    }
  }, [
    type,
    newName,
    newSecondName,
    name,
    username,
    userId,
    dispatch,
    setPresentModal,
    usernameUpdateDate
  ]);

  return (
    <ModalView
      show={presentModal}
      setShow={setPresentModal}
      backgroundColor={colors.white}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color={colors.black}>
        Change {type === "name" ? "Name" : "Username"}
      </Text>

      <Input
        placeholder={type === "name" ? "First Name" : "Username"}
        onChangeText={(text) => setNewName(text)}
        value={newName}
        autoCapitalize={type === "username" ? "none" : "sentences"}
        autoCorrect={type !== "username"}
        textContentType={type === "username" ? "username" : "givenName"}
        backgroundColor={colors.lightGray}
        textColor={colors.black}
      />

      {type === "username" ? null : (
        <Input
          placeholder={type === "name" ? "Last Name" : "Username"}
          onChangeText={(text) => setNewSecondName(text)}
          value={newSecondName}
          backgroundColor={colors.lightGray}
          textColor={colors.black}
        />
      )}

      {type === "username" && (
        <View style={[padding.largeWidget, styles.usernameContainer]}>
          <Text
            type="body"
            italic
            style={styles.usernameHelperText}
            color={usernameExists ? colors.red : colors.green}
          >
            {helperText.length > 0 && (
              <FontAwesome5
                name={usernameExists ? "times" : "check"}
                size={12}
                color={usernameExists ? colors.red : colors.green}
              />
            )}{" "}
            {helperText}
          </Text>
        </View>
      )}

      <Button
        text={"Change " + type}
        color={colors.primary}
        textColor={colors.white}
        onPress={changeName}
        leadingIcon="check"
      />

      <Button
        text="Cancel"
        color={colors.lightGray}
        textColor={colors.black}
        onPress={() => setPresentModal(false)}
        leadingIcon="times"
      />
    </ModalView>
  );
}

const styles = StyleSheet.create({
  usernameContainer: {
    backgroundColor: colors.lightGray,
    width: "100%"
  },
  usernameHelperText: {
    textAlign: "center"
  }
});
