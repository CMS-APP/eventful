import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import * as Application from "expo-application";

import { AppStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { useDataActions } from "@/features/settings/hooks/useDataActions";
import { useDeleteAccount } from "@/features/settings/hooks/useDeleteAccount";

import { SettingsCard } from "./SettingsCard";
import { SettingsPasswordModal } from "./SettingsPasswordModal";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

function formatCacheSize(bytes: number): string {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes < 1) {
    return "< 1 MB";
  }
  return `${Math.round(megabytes)} MB`;
}

export function DataSettings() {
  const navigation = useNavigation<StackNavigationProp<AppStackParamList>>();

  const {
    cacheSize,
    clearCacheAlert,
    clearingCache,
    resetSpotifyDataAlert,
    resettingSpotify
  } = useDataActions();

  const {
    handleDeleteAccount,
    deleting,
    presentPasswordModal,
    setPresentPasswordModal,
    inputText,
    setInputText,
    deleteAccount
  } = useDeleteAccount();

  const openPrivacyPolicy = () => {
    navigation.navigate("WebView", {
      title: "Privacy Policy",
      uri: "https://app.eventfulapp.com/about/privacy-headerless"
    });
  };

  const openFeedback = () => {
    navigation.navigate("Feedback");
  };

  return (
    <View style={styles.container}>
      <SettingsPasswordModal
        presentPasswordModal={presentPasswordModal}
        setPresentPasswordModal={setPresentPasswordModal}
        inputText={inputText}
        setInputText={setInputText}
        submitFunction={deleteAccount}
      />

      <View style={styles.section}>
        <SettingsSectionHeader title="Data" />
        <SettingsCard
          rows={[
            {
              icon: "spotify",
              label: "Reset Spotify Data",
              onPress: resetSpotifyDataAlert,
              showChevron: false,
              loading: resettingSpotify
            },
            {
              icon: "database",
              label: "Clear Cache",
              value: formatCacheSize(cacheSize),
              onPress: clearCacheAlert,
              showChevron: false,
              loading: clearingCache
            }
          ]}
        />
      </View>

      <View style={styles.section}>
        <SettingsSectionHeader title="Support" />
        <SettingsCard
          rows={[
            {
              icon: "comment-dots",
              label: "App Feedback",
              onPress: openFeedback
            },
            {
              icon: "lock",
              label: "Privacy Policy",
              onPress: openPrivacyPolicy
            }
          ]}
        />
      </View>

      <View style={styles.section}>
        <SettingsSectionHeader title="Account Actions" />
        <SettingsCard
          rows={[
            {
              icon: "trash-alt",
              label: "Delete Account",
              onPress: handleDeleteAccount,
              showChevron: false,
              destructive: true,
              loading: deleting
            }
          ]}
        />
        <Text type="caption" color={colors.gray} style={styles.disclaimer}>
          This removes all your data permanently
        </Text>
      </View>

      <Text type="body" color={colors.gray} style={styles.version}>
        Eventful {Application.nativeApplicationVersion} (
        {Application.nativeBuildVersion})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 20
  },
  disclaimer: {
    marginTop: 4,
    paddingHorizontal: 4
  },
  section: {
    gap: 8
  },
  version: {
    textAlign: "center"
  }
});
