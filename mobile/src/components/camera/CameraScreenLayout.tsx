import type { ReactNode } from "react";

import { StyleSheet, View } from "react-native";

import { colors } from "@/design-system/tokens/colors";

interface CameraScreenLayoutProps {
  onLayout?: () => void;
  preview: ReactNode;
  children: ReactNode;
}

export function CameraScreenLayout({
  onLayout,
  preview,
  children
}: CameraScreenLayoutProps) {
  return (
    <View style={styles.container} onLayout={onLayout}>
      {preview}
      <View pointerEvents="box-none" style={styles.overlay}>
        {children}
      </View>
    </View>
  );
}

export const cameraPreviewStyle = StyleSheet.absoluteFill;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black,
    flex: 1
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  }
});
