import { StyleSheet, View } from "react-native";

import { LoadingIndicator } from "@/components/views/LoadingIndicator";
import { LoadingProgressIndicator } from "@/components/views/LoadingProgressIndicator";
import { useLoading } from "@/providers/LoadingProvider";
import { colors } from "@/styles/colors";

export function LoadingScreen() {
  const { isLoading, progress, currentStep, totalSteps } = useLoading();

  return (
    <View style={styles.container}>
      {isLoading && totalSteps > 0 ? (
        <LoadingProgressIndicator
          progress={progress}
          currentStep={currentStep}
          totalSteps={totalSteps}
          size={100}
        />
      ) : (
        <LoadingIndicator size={100} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.primary,
    flex: 1,
    justifyContent: "center"
  }
});
