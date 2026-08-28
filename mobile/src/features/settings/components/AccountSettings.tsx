import { arrayUnion } from "@react-native-firebase/firestore";
import Collapsible from "react-native-collapsible";
import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { usePaymentProvider } from "@/app/context/payment/PaymentContext";
import { openSubscriptionManagement } from "@/app/update";
import { Button } from "@/design-system/components/Button";
import { colors } from "@/design-system/tokens/colors";
import { updateUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { registerForPushNotificationsAsync } from "@/services/pushNotifications";
import { UserState } from "@/store/UserSlice";
import { showErrorToast } from "@/utils/toast";

import { ChangeNameModal } from "./ChangeNameModal";
import { DropdownButton } from "./DropdownButton";

export function AccountSettings() {
  const [presentModal, setPresentModal] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [type, setType] = useState("");

  const userId = useSelector((state: UserState) => state.uid);
  const premium = useSelector((state: UserState) => state.premium);
  const photoBooth = useSelector((state: UserState) => state.photoBooth);

  const paymentProvider = usePaymentProvider();
  const restorePermissions = paymentProvider?.restorePermissions;

  const requestNotifications = useCallback(async () => {
    try {
      const result = await registerForPushNotificationsAsync();

      if (result) {
        await updateUserInfo(userId, {
          pushTokens: arrayUnion(result) as any
        });
        Alert.alert("Success", "You are now registered for notifications.");
      }
    } catch {
      showErrorToast("Error Requesting Notifications");
    }
  }, [userId]);

  const toggleAccount = useCallback(
    () => setAccountOpen(!accountOpen),
    [accountOpen]
  );

  const toggleModal = useCallback(
    () => setPresentModal(!presentModal),
    [presentModal]
  );

  const handleNamePress = useCallback(() => {
    setType("name");
    toggleModal();
  }, [toggleModal]);

  const handleUsernamePress = useCallback(() => {
    setType("username");
    toggleModal();
  }, [toggleModal]);

  const handleEnableNotificationsPress = useCallback(() => {
    requestNotifications();
  }, [requestNotifications]);

  const handleRestorePurchasesPress = useCallback(() => {
    if (restorePermissions) {
      restorePermissions();
    }
  }, [restorePermissions]);

  const handleManageSubscriptionPress = useCallback(async () => {
    try {
      await openSubscriptionManagement();
    } catch {
      showErrorToast("Error Opening Settings");
    }
  }, []);

  return (
    <View style={styles.container}>
      <ChangeNameModal
        presentModal={presentModal}
        setPresentModal={setPresentModal}
        type={type}
      />

      <DropdownButton
        isDropdownClosed={!accountOpen}
        toggleDropdown={toggleAccount}
        title="Account Settings"
      />

      <Collapsible collapsed={!accountOpen}>
        <View style={styles.buttonColumn}>
          <Button
            text="Change Name"
            color={colors.primaryTint3}
            textColor={colors.white}
            onPress={handleNamePress}
            leadingIcon="user-edit"
          />

          <Button
            text="Change Username"
            color={colors.primaryTint3}
            textColor={colors.white}
            onPress={handleUsernamePress}
            leadingIcon="user-edit"
          />

          <Button
            text="Enable Notifications"
            color={colors.primaryTint3}
            textColor={colors.white}
            onPress={handleEnableNotificationsPress}
            leadingIcon="bell"
          />

          <Button
            text="Restore Purchases"
            color={colors.primaryTint3}
            textColor={colors.white}
            onPress={handleRestorePurchasesPress}
            leadingIcon="shopping-cart"
          />

          {(premium || photoBooth) && (
            <Button
              text="Manage subscription"
              color={colors.primaryTint3}
              textColor={colors.white}
              onPress={handleManageSubscriptionPress}
              leadingIcon="cog"
            />
          )}
        </View>
      </Collapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonColumn: {
    gap: 12,
    marginBottom: 6,
    marginTop: 6
  },
  container: {
    gap: 6,
    marginTop: 6
  }
});
