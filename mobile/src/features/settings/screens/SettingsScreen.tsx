import { StyleSheet, View } from "react-native";

import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";

import { AccountSettings } from "../components/AccountSettings";
import { DataSettings } from "../components/DataSettings";

export function SettingsScreen() {
  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Settings",
          icon: "cog",
          color: colors.white,
          accountButton: false,
          backgroundColor: colors.primary,
          backAction: true
        }
      }}
      contentConfig={{
        tabBarPresent: true
      }}
    >
      <View style={styles.container}>
        <AccountSettings />
        <DataSettings />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    marginTop: 52,
    paddingHorizontal: 16
  }
});
