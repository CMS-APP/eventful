import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

function CollageBox() {
  return <View style={styles.collageBox} />;
}

function CollageBoxes({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => (
    <CollageBox key={index} />
  ));
}

export function CameraCollageDiagram({
  collageStyle
}: {
  collageStyle: string;
}) {
  if (collageStyle === "single") {
    return <View style={styles.singleCollageBox} />;
  }

  if (collageStyle === "square") {
    return (
      <View style={styles.collageContainer}>
        <View style={styles.collageRow}>
          <CollageBoxes count={2} />
        </View>
        <View style={styles.collageRow}>
          <CollageBoxes count={2} />
        </View>
      </View>
    );
  }

  if (collageStyle === "row") {
    return (
      <View style={styles.collageRow}>
        <CollageBoxes count={3} />
      </View>
    );
  }

  if (collageStyle === "column") {
    return (
      <View style={styles.collageColumn}>
        <CollageBoxes count={3} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  collageBox: {
    backgroundColor: colors.black,
    height: 30,
    width: 30
  },
  collageColumn: {
    flexDirection: "column",
    gap: 2
  },
  collageContainer: {
    gap: 2
  },
  collageRow: {
    flexDirection: "row",
    gap: 2
  },
  singleCollageBox: {
    backgroundColor: colors.black,
    height: 62,
    width: 62
  }
});
