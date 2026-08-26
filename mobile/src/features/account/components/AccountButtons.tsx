import { useDispatch } from "react-redux";

import { Alert, StatusBar, StyleSheet, View } from "react-native";

import { CommonActions, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  ILoadingModalContext,
  useLoadingModal
} from "@/contexts/LoadingProviderContext";
import { Button } from "@/design-system/components/Button";
import { colors } from "@/design-system/tokens/colors";
import { AllStackParamList } from "@/features/app/navigationTypes";
import { handleSignOut } from "@/services/firebase/firebaseAuth";
import { AppError } from "@/utils/error";

export function AccountButtons() {
  const { setLoading } = useLoadingModal() as ILoadingModalContext;
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<AllStackParamList>>();

  async function signOut() {
    try {
      setLoading(true);
      handleSignOut(dispatch);
      signOutNavigation();
    } catch (error) {
      new AppError(error, "Error signing out", true);
    } finally {
      setLoading(false);
    }
  }

  function signOutAlert() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
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
      navigation.dispatch(
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
        icon="gift"
        onPress={() => {
          navigation.navigate("Paywall" as never);
        }}
      />

      <Button
        text="Settings"
        color={colors.primaryTint}
        textColor={colors.white}
        flex={undefined}
        icon="cog"
        onPress={() => {
          navigation.navigate("Settings" as never);
        }}
      />

      <Button
        text="Sign out"
        color={colors.primary}
        textColor={colors.white}
        flex={undefined}
        icon="sign-out-alt"
        onPress={() => {
          signOutAlert();
        }}
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
