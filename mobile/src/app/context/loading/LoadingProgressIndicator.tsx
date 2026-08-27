import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";

import { LoadingIndicator } from "./LoadingIndicator";

interface LoadingProgressIndicatorProps {
  progress?: number;
  currentStep?: string;
  totalSteps?: number;
}

export function LoadingProgressIndicator({
  progress = 0,
  currentStep = "",
  totalSteps = 0
}: LoadingProgressIndicatorProps) {
  const progressPercentage = Math.min(progress / totalSteps, 1);

  return (
    <View style={styles.container}>
      <LoadingIndicator />
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercentage * 100}%` }
            ]}
          />
        </View>
        <Text type="body" color="white" style={styles.progressText}>
          {Math.round(progressPercentage * 100)}%
        </Text>
      </View>

      <View style={styles.stepContainer}>
        {currentStep && (
          <Text type="body" color="white">
            {currentStep}
          </Text>
        )}

        {totalSteps > 0 && (
          <Text type="body" color="white">
            Step {progress} of {totalSteps}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    padding: 24
  },
  progressBar: {
    backgroundColor: colors.white + "40",
    borderRadius: 4,
    height: 8,
    marginBottom: 12,
    overflow: "hidden"
  },
  progressContainer: {
    marginVertical: 24,
    width: 300
  },
  progressFill: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: "100%"
  },
  progressText: {
    textAlign: "center"
  },
  stepContainer: {
    alignItems: "center"
  }
});
