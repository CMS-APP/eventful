import { StyleSheet, View } from "react-native";

import { useBoot } from "@/app/context/loading/BootContext";
import { LoadingProgressIndicator } from "@/components/views/LoadingProgressIndicator";
import { colors } from "@/design-system/tokens/colors";

export function LoadingScreen() {
  const { progress, currentStep } = useBoot();

  return (
    <View style={styles.container}>
      <LoadingProgressIndicator
        progress={progress}
        currentStep={currentStep}
        totalSteps={6}
      />
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
