import { Timestamp } from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";
import { useDispatch, useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Button } from "@/components/buttons/Button";
import { Input } from "@/components/inputs/Input";
import { Text } from "@/components/text/Text";
import { ModalView } from "@/components/views/ModalView";
import {
  changeHostname,
  checkUsernameExists,
  updateUserInfo
} from "@/services/firebase/firebaseUserFunctions";
import {
  UserState,
  setFirstName,
  setLastName,
  setName,
  setUsername,
  setUsernameUpdateDate
} from "@/store/UserSlice";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { parseDatabaseDate } from "@/utils/date";
import { AppError } from "@/utils/error";
import { checkValue as checkValueUtil } from "@/utils/regex";

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
  const username = useSelector((state: UserState) => state.username);
  const usernameUpdateDate = useSelector(
    (state: UserState) => state.usernameUpdateDate
  );
  const dispatch = useDispatch();

  const usernameExistsFunc = useCallback(async (username: string) => {
    return await checkUsernameExists(username.toLowerCase());
  }, []);

  const checkNames = useCallback(async () => {
    if (type === "name") {
      const firstName = checkValueUtil(newName, "first name");
      const lastName = checkValueUtil(newSecondName, "last name");

      if (firstName?.valid === null && lastName?.valid === null) {
        setUsernameExists(null);
        setHelperText("");
      } else if (!firstName?.valid || !lastName?.valid) {
        setUsernameExists(true);
        setHelperText(firstName?.message || lastName?.message || "");
      } else {
        setUsernameExists(false);
        setHelperText("");
      }
    } else if (type === "username") {
      const username = checkValueUtil(newName, "username");
      if (username?.valid === null) {
        setUsernameExists(null);
        setHelperText("");
      } else if (!username?.valid) {
        setUsernameExists(true);
        setHelperText(username?.message || "");
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
  }, [newName, newSecondName, type, usernameExistsFunc]);

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
      new AppError(error, "Error changing name", true);
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
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color={colors.white}>
        Change {type === "name" ? "Name" : "Username"}
      </Text>

      <Input
        placeholder={type === "name" ? "First Name" : "Username"}
        onChangeText={(text) => setNewName(text)}
        value={newName}
        dark
      />

      {type === "username" ? null : (
        <Input
          placeholder={type === "name" ? "Last Name" : "Username"}
          onChangeText={(text) => setNewSecondName(text)}
          value={newSecondName}
          dark
        />
      )}

      {type === "username" && (
        <View style={[globalStyles.largeWidget, styles.usernameContainer]}>
          <Text
            type="body"
            italic
            style={styles.usernameHelperText}
            color={usernameExists ? colors.red : colors.green}
          >
            {helperText.length > 0 && (
              <FontAwesome5
                name={usernameExists ? "times-circle" : "check-circle"}
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
        color={colors.primaryTint}
        textColor={colors.white}
        onPress={changeName}
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
