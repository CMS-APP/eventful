import { useDispatch } from "react-redux";

import { useState } from "react";

import { StatusBar, StyleSheet, View } from "react-native";

import { CommonActions, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, navigationRef } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import { handleSignOut } from "@/services/firebase/auth";
import { showOptionsAlert } from "@/utils/alertModal";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

export function AccountButtons() {
  const [signingOut, setSigningOut] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<AllStackParamList>>();

  async function signOut() {
    try {
      setSigningOut(true);
      handleSignOut(dispatch);
      signOutNavigation();
    } catch (error) {
      log(`Error Signing Out: ${error}`, "error");
      showErrorToast("Error Signing Out");
    } finally {
      setSigningOut(false);
    }
  }

  function signOutAlert() {
    showOptionsAlert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Yes",
        style: "destructive",
        onPress: signOut
      },
      {
        text: "Cancel",
        style: "cancel"
      }
    ]);
  }

  function signOutNavigation() {
    StatusBar.setBarStyle("light-content");
    navigation.navigate("LoadingScreen" as never);

    setTimeout(() => {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Auth" }]
        })
      );
    }, 3000);
  }

  return (
    <View style={styles.container}>
      <Button
        text="Subscriptions"
        color={colors.secondary}
        textColor={colors.white}
        flex={undefined}
        leadingIcon="gift"
        onPress={() => {
          navigation.navigate("Paywall" as never);
        }}
      />

      <Button
        text="Settings"
        color={colors.primaryTint}
        textColor={colors.white}
        flex={undefined}
        leadingIcon="cog"
        onPress={() => {
          navigation.navigate("Settings" as never);
        }}
      />

      <Button
        text="Sign out"
        color={colors.primary}
        textColor={colors.white}
        flex={undefined}
        leadingIcon="sign-out-alt"
        onPress={() => {
          signOutAlert();
        }}
        loading={signingOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 24
  }
});
