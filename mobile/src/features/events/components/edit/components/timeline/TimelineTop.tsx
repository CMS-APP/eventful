import { StyleSheet, View } from "react-native";

import { SemiCircleProgressBar } from "@/features/home/components/SemiCircleProgressBar";
import { colors } from "@/styles/colors";

interface TimelineTopProps {
  percentageComplete: number;
}

export function TimelineTop({ percentageComplete }: TimelineTopProps) {
  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <SemiCircleProgressBar
          percentage={percentageComplete}
          colorScheme={[colors.primary, colors.white, colors.transparent]}
          showProgress={false}
          title=""
        />
      </View>

      <View style={styles.progressBar} />
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
    width: 6
  },
  progressBar: {
    backgroundColor: colors.white,
    height: 6,
    width: 100
  },
  progressBarContainer: {
    height: 50,
    top: -25
  }
});
