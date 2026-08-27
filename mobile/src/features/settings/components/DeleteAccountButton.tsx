import {
  AppleAuthProvider,
  EmailAuthProvider,
  FirebaseAuthTypes,
  GoogleAuthProvider,
  deleteUser,
  getAuth,
  reauthenticateWithCredential
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useDispatch, useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert, Platform, StatusBar } from "react-native";

import { CommonActions, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigationTypes";
import { Button } from "@/design-system/components/Button";
import { colors } from "@/design-system/tokens/colors";
import {
  getAppleCredentialForReauthentication,
  revokeSignInWithAppleToken
} from "@/features/settings/utils/apple";
import { removeAllData } from "@/services/async";
import { deleteImageAsync } from "@/services/firebase/firebaseStorage";
import { deleteUserData } from "@/services/firebase/firebaseUserFunctions";
import { UserState, clearStorage } from "@/store/UserSlice";
import { showErrorNotification } from "@/utils/appNotifications";
import { log } from "@/utils/logging";

import { SettingsPasswordModal } from "./SettingsPasswordModal";

export function DeleteAccountButton() {
  const userId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation<StackNavigationProp<AllStackParamList>>();
  const dispatch = useDispatch();

  const [presentPasswordModal, setPresentPasswordModal] = useState(false);
  const [inputText, setInputText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const deleteAllUserData = useCallback(async () => {
    await deleteUserData(userId);
    dispatch(clearStorage());
  }, [dispatch, userId]);

  const signOutNavigation = useCallback(() => {
    StatusBar.setBarStyle("light-content");
    navigation.goBack();
    navigation.navigate("LoadingScreen" as never);

    setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }]
        })
      );
    }, 500);
  }, [navigation]);

  const finalizeAccountDeletion = useCallback(
    async (user: FirebaseAuthTypes.User) => {
      const storageString = `${user.uid}/profilePicture`;

      try {
        await deleteImageAsync(storageString);
      } catch {
        log("No profile picture to delete", "info");
      }
      await removeAllData();
      await deleteAllUserData();

      if (
        user.providerData?.some(
          (provider) => provider.providerId === "google.com"
        )
      ) {
        await GoogleSignin.signOut();
      }

      if (
        Platform.OS === "ios" &&
        user.providerData?.some(
          (provider) => provider.providerId === "apple.com"
        )
      ) {
        try {
          await revokeSignInWithAppleToken();
        } catch {
          log("Error revoking Apple token", "error");
        }
      }

      await deleteUser(user);

      dispatch(clearStorage());
      signOutNavigation();

      Alert.alert(
        "Sorry to see you go",
        "Your account and data has been deleted - we hope to see you soon."
      );
    },
    [deleteAllUserData, dispatch, signOutNavigation]
  );

  const deleteAccountWithGoogle = useCallback(async () => {
    try {
      setDeleting(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error("No ID token found");
      }
      const googleCredential = GoogleAuthProvider.credential(idToken);
      await reauthenticateWithCredential(user, googleCredential);
      await finalizeAccountDeletion(user);
    } catch (error: any) {
      log(
        `Error deleting account: ${(error as any)?.message ?? error}`,
        "error"
      );
      showErrorNotification("Error Deleting Account");
    } finally {
      setDeleting(false);
    }
  }, [finalizeAccountDeletion]);

  const deleteAccountWithApple = useCallback(async () => {
    try {
      setDeleting(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const { identityToken, nonce } =
        await getAppleCredentialForReauthentication();
      const appleCredential = AppleAuthProvider.credential(
        identityToken,
        nonce
      );
      await reauthenticateWithCredential(user, appleCredential);
      await finalizeAccountDeletion(user);
    } catch (error: any) {
      log(
        `Error deleting account: ${(error as any)?.message ?? error}`,
        "error"
      );
      showErrorNotification("Error Deleting Account");
    } finally {
      setDeleting(false);
    }
  }, [finalizeAccountDeletion]);

  const handleDeleteAccount = useCallback(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const providerIds = user.providerData.map(
      (provider) => provider.providerId
    );

    if (providerIds.includes("password")) {
      setPresentPasswordModal(true);
      return;
    }

    if (providerIds.includes("google.com")) {
      Alert.alert(
        "Delete account",
        "You will need to sign in with Google again to confirm deletion.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: () => void deleteAccountWithGoogle() }
        ]
      );
      return;
    }

    if (Platform.OS === "ios" && providerIds.includes("apple.com")) {
      Alert.alert(
        "Delete account",
        "You will need to sign in with Apple again to confirm deletion.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: () => void deleteAccountWithApple() }
        ]
      );
      return;
    }

    Alert.alert(
      "Unable to delete account",
      "We could not determine how you signed in. Please contact support for help."
    );
  }, [deleteAccountWithApple, deleteAccountWithGoogle]);

  const deleteAccount = useCallback(async () => {
    try {
      setDeleting(true);
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const credential = EmailAuthProvider.credential(
        user.email as string,
        inputText
      );
      await reauthenticateWithCredential(user, credential);
      await finalizeAccountDeletion(user);
    } catch (error) {
      if (
        (error as any).code === "auth/wrong-password" ||
        (error as any).code === "auth/invalid-credential"
      ) {
        Alert.alert("Error", "Incorrect password, please try again.");
      } else {
        log(
          `Error deleting account: ${(error as any)?.message ?? error}`,
          "error"
        );
        showErrorNotification("Error Deleting Account");
      }
    } finally {
      setDeleting(false);
    }
  }, [finalizeAccountDeletion, inputText]);

  return (
    <>
      <SettingsPasswordModal
        presentPasswordModal={presentPasswordModal}
        setPresentPasswordModal={setPresentPasswordModal}
        inputText={inputText}
        setInputText={setInputText}
        submitFunction={deleteAccount}
      />

      <Button
        text="Delete Account"
        color={colors.primaryTint3}
        textColor={colors.white}
        onPress={handleDeleteAccount}
        icon="trash-alt"
        loading={deleting}
      />
    </>
  );
}
