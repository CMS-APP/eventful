import { StyleSheet, View } from "react-native";

import { ArcCutout } from "@/components/views/ArcCutout";
import { colors } from "@/design-system/tokens/colors";

interface HeaderArcsProps {
  headerHeight: number;
}

export function HeaderArcs({ headerHeight }: HeaderArcsProps) {
  return (
    <>
      <View style={[styles.container, styles.leftArc, { top: headerHeight }]}>
        <ArcCutout color={colors.primary} rotation={270} />
      </View>

      <View style={[styles.container, styles.rightArc, { top: headerHeight }]}>
        <ArcCutout color={colors.primary} rotation={0} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    position: "absolute",
    width: 40,
    zIndex: 1000
  },
  leftArc: {
    left: 0
  },
  rightArc: {
    right: 0
  }
});
