import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

export type CollageOption = {
  style: string;
  label: string;
  columns: number;
  rows: number;
};

export function CollageDiagram({ columns, rows }: CollageOption) {
  const isStrip = columns === 1 && rows > 1;

  return (
    <View style={[styles.diagram, isStrip && styles.diagramStrip]}>
      {Array.from({ length: rows }, (_, row) => (
        <View key={`row-${row}`} style={styles.diagramRow}>
          {Array.from({ length: columns }, (_, column) => (
            <View key={`cell-${row}-${column}`} style={styles.diagramCell} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  diagram: {
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    gap: 2,
    height: 44,
    padding: 3,
    width: 36
  },
  diagramCell: {
    backgroundColor: colors.primaryTint,
    borderRadius: 1,
    flex: 1
  },
  diagramRow: {
    flex: 1,
    flexDirection: "row",
    gap: 2
  },
  diagramStrip: {
    width: 18
  }
});
