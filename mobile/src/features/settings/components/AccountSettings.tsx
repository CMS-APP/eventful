import { useDispatch, useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StyleSheet, View } from "react-native";

import { usePaymentProvider } from "@/app/context/payment/PaymentContext";
import { usePushNotificationsToggle } from "@/app/hooks/usePushNotificationsToggle";
import { openSubscriptionManagement } from "@/app/update";
import { trackSettingsNotificationsToggled } from "@/services/analytics/events";
import { updateUserInfo } from "@/services/firebase/user";
import { UserState, setEmailNotifications } from "@/store/UserSlice";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { ChangeNameModal } from "./ChangeNameModal";
import { SettingsCard, SettingsCardRow } from "./SettingsCard";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

export function AccountSettings() {
  const [presentModal, setPresentModal] = useState(false);
  const [type, setType] = useState("");

  const dispatch = useDispatch();
  const userId = useSelector((state: UserState) => state.uid);
  const name = useSelector((state: UserState) => state.name);
  const username = useSelector((state: UserState) => state.username);
  const premium = useSelector((state: UserState) => state.premium);
  const photoBooth = useSelector((state: UserState) => state.photoBooth);
  const emailNotifications = useSelector(
    (state: UserState) => state.emailNotifications
  );

  const { pushNotifications, togglePushNotifications } =
    usePushNotificationsToggle();

  const paymentProvider = usePaymentProvider();
  const restorePermissions = paymentProvider?.restorePermissions;

  const handleToggleEmailNotifications = useCallback(async () => {
    try {
      const newValue = !emailNotifications;
      await updateUserInfo(userId, { emailNotifications: newValue });
      dispatch(setEmailNotifications(newValue));
      trackSettingsNotificationsToggled("email", newValue);
    } catch (error) {
      log(`Error Updating Email Notifications: ${error}`, "error");
      showErrorToast("Error Updating Email Notifications");
    }
  }, [emailNotifications, userId, dispatch]);

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

  const handleRestorePurchasesPress = useCallback(() => {
    if (restorePermissions) {
      restorePermissions();
    }
  }, [restorePermissions]);

  const handleManageSubscriptionPress = useCallback(async () => {
    try {
      await openSubscriptionManagement();
    } catch (error) {
      log(`Error Opening Settings: ${error}`, "error");
      showErrorToast("Error Opening Settings");
    }
  }, []);

  const subscriptionRows: SettingsCardRow[] = [
    {
      icon: "crown",
      label: "Manage Subscription",
      value: premium ? "Premium" : photoBooth ? "Photo Booth" : "Free",
      onPress: handleManageSubscriptionPress
    },
    {
      icon: "shopping-cart",
      label: "Restore Purchases",
      onPress: handleRestorePurchasesPress,
      showChevron: false
    }
  ];

  return (
    <View style={styles.container}>
      <ChangeNameModal
        presentModal={presentModal}
        setPresentModal={setPresentModal}
        type={type}
      />

      <View style={styles.section}>
        <SettingsSectionHeader title="Account" />
        <SettingsCard
          rows={[
            {
              icon: "user-edit",
              label: "Name",
              value: name,
              onPress: handleNamePress
            },
            {
              icon: "at",
              label: "Username",
              value: username,
              onPress: handleUsernamePress
            }
          ]}
        />
      </View>

      <View style={styles.section}>
        <SettingsSectionHeader title="Notifications" />
        <SettingsCard
          rows={[
            {
              icon: "bell",
              label: "Push Notifications",
              toggle: {
                value: pushNotifications,
                onToggle: togglePushNotifications
              }
            },
            {
              icon: "envelope",
              label: "Email Notifications",
              toggle: {
                value: emailNotifications,
                onToggle: handleToggleEmailNotifications
              }
            }
          ]}
        />
      </View>

      <View style={styles.section}>
        <SettingsSectionHeader title="Subscription" />
        <SettingsCard rows={subscriptionRows} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 6
  },
  section: {
    gap: 8
  }
});
