import { Image, LayoutChangeEvent, StyleSheet, View } from "react-native";

import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";

interface HeaderProps {
  title: string;
  onLayout: (event: LayoutChangeEvent) => void;
}

export function Header({ title, onLayout }: HeaderProps) {
  return (
    <View
      style={[
        styles.container,
        { paddingTop: useSafeAreaStyles().safeArea.paddingTop + 15 }
      ]}
      onLayout={onLayout}
    >
      <View style={styles.logoContainer}>
        <View style={styles.logoBackground}>
          <Image
            source={require("@/assets/logos/eventful-logo.png")}
            style={styles.logo}
          />
        </View>
        <Text type="title" color={colors.white}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    backgroundColor: colors.primary,
    flexDirection: "row"
  },
  logo: {
    height: 60,
    width: 60
  },
  logoBackground: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.secondary,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    padding: 6
  },
  logoContainer: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    paddingBottom: 12
  }
});
