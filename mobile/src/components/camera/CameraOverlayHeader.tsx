import type { ReactNode } from "react";

import { StyleSheet, View } from "react-native";

import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";

interface CameraOverlayHeaderProps {
  title: string;
  subtitle: string;
  visible?: boolean;
  children?: ReactNode;
}

export function CameraOverlayHeader({
  title,
  subtitle,
  visible = true,
  children
}: CameraOverlayHeaderProps) {
  const { paddingTop } = useSafeAreaStyles().safeArea;

  if (!visible) return null;

  return (
    <View
      style={[padding.largeWidget, styles.header, { top: paddingTop + 24 }]}
    >
      <View style={styles.content}>
        <Text type="header" color={colors.white}>
          {title}
        </Text>
        <Text type="subHeader" color={colors.white}>
          {subtitle}
        </Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    gap: 12,
    width: "100%"
  },
  header: {
    backgroundColor: colors.black,
    gap: 0,
    left: 30,
    opacity: 0.8,
    position: "absolute",
    right: 30
  }
});
