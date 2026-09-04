import { StyleSheet, View } from "react-native";

import { PhotoBoothStatTile } from "./PhotoBoothStatTile";

interface PhotoBoothStatsRowProps {
  photosTaken: number;
  inTheCloud: number;
  events: number;
}

export function PhotoBoothStatsRow({
  photosTaken,
  inTheCloud,
  events
}: PhotoBoothStatsRowProps) {
  return (
    <View style={styles.container}>
      <PhotoBoothStatTile value={photosTaken} label="Photos Taken" />
      <PhotoBoothStatTile value={inTheCloud} label="Uploaded" />
      <PhotoBoothStatTile
        value={events}
        label={events > 1 ? "Events" : "Event"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12
  }
});
