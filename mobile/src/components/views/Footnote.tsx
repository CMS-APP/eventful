import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/styles/colors";

interface FootNoteProps {
  icon?: keyof typeof FontAwesome5.glyphMap;
  color: string;
  colorLeft: string;
}

export function FootNote({ icon, color, colorLeft }: FootNoteProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.triangleLeft, { borderBottomColor: colorLeft }]} />

      <View style={styles.viewStyle}>
        <View style={[styles.rectangle, { backgroundColor: color }]} />
        <View style={styles.triangleRow}>
          <View
            style={[
              styles.triangle,
              styles.triangle1,
              { borderBottomColor: color }
            ]}
          />
          <View
            style={[
              styles.triangle,
              styles.triangle2,
              { borderBottomColor: color }
            ]}
          />
        </View>

        <View style={styles.iconContainer}>
          <FontAwesome5
            name={icon as keyof typeof FontAwesome5.glyphMap}
            size={24}
            color={colors.white}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginLeft: 40,
    top: -15
  },
  iconContainer: {
    position: "absolute",
    top: 10
  },
  rectangle: {
    height: 40,
    width: 60
  },
  triangle: {
    backgroundColor: colors.transparent,
    borderBottomWidth: 40,
    borderLeftColor: colors.transparent,
    borderRightColor: colors.transparent
  },
  triangle1: {
    borderLeftWidth: 0,
    borderRightWidth: 20,
    transform: [{ rotate: "90deg" }, { translateX: -10 }]
  },
  triangle2: {
    borderLeftWidth: 20,
    borderRightWidth: 0,
    transform: [{ rotate: "-90deg" }, { translateX: 10 }]
  },
  triangleLeft: {
    backgroundColor: colors.transparent,
    borderBottomWidth: 15,
    borderLeftColor: colors.transparent,
    borderLeftWidth: 10,
    borderRightColor: colors.transparent,
    borderRightWidth: 0,
    transform: [{ rotate: "0deg" }, { translateY: -25 }]
  },
  triangleRow: {
    flexDirection: "row"
  },
  viewStyle: {
    alignItems: "center",
    height: 40,
    width: 60
  }
});
