import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";

import { AccountSettings } from "../components/AccountSettings";
import { DataSettings } from "../components/DataSettings";
import { FeedbackButtons } from "../components/FeedbackButtons";

export function SettingsScreen() {
  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Settings",
          dark: true,
          backAction: true,
          backgroundColor: colors.primary
        },
        backgroundColor: colors.primary
      }}
      contentConfig={{
        tabBarPresent: true,
        backgroundColor: colors.primary
      }}
    >
      <View style={styles.container}>
        <AccountSettings />
        <DataSettings />
        <FeedbackButtons />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1,
    paddingHorizontal: 24
  }
});
