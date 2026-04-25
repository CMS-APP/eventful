import { StyleSheet, View } from "react-native";

import { colors } from "@/styles/colors";

export function TimelineDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  divider: {
    backgroundColor: colors.white,
    height: 30,
    marginBottom: 12,
    width: 6
  }
});
