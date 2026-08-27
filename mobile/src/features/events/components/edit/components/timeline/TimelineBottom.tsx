import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

export function TimelineBottom() {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <View style={styles.bottomBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: colors.white,
    height: 6,
    width: 60
  },
  container: {
    alignItems: "center"
  },
  divider: {
    backgroundColor: colors.white,
    height: 30,
    width: 6
  }
});
