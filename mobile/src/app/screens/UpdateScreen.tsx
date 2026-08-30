import { Image, StyleSheet, View } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { openAppStore } from "../update";

export function UpdateScreen() {
  const handleUpdateNow = async () => {
    haptics.soft();
    try {
      await openAppStore();
    } catch (error) {
      log(`Error Opening App Store: ${error}`, "error");
      showErrorToast("Error Opening App Store");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/icons/update.png")}
        style={styles.icon}
        resizeMode="contain"
      />

      <Text type="header" color={colors.white}>
        Update Required
      </Text>

      <Text type="body" color={colors.white} center>
        Please update to the latest version to continue using all features
      </Text>

      <Button
        text="Update Now"
        onPress={handleUpdateNow}
        color={colors.primaryTint}
        textColor={colors.white}
        leadingIcon="cloud-download-alt"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.primary,
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24
  },
  icon: {
    height: 150,
    width: 150
  }
});
