import { type ReactNode, useEffect, useState } from "react";

import {
  Image,
  ImageBackground,
  Keyboard,
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { shadows } from "@/design-system/tokens/shadows";

const HERO_HEIGHT = 300;
const PANEL_OVERLAP = 40;

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  subtitle,
  onBack,
  children,
  footer
}: AuthLayoutProps) {
  const { safeArea } = useSafeAreaStyles();
  const [footerHeight, setFooterHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", () =>
      setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener("keyboardWillHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const contentPaddingBottom = keyboardVisible
    ? 16
    : 16 + (footer ? footerHeight : safeArea.paddingBottom);

  function handleFooterLayout(event: LayoutChangeEvent) {
    setFooterHeight(event.nativeEvent.layout.height);
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/backgrounds/welcome-background.png")}
        resizeMode="cover"
        style={styles.hero}
      >
        <View style={styles.overlay} />

        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={getHitSlop("medium")}
            style={[styles.backButton, { top: safeArea.paddingTop + 6 }]}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <FontAwesome5 name="arrow-left" size={22} color={colors.white} />
          </TouchableOpacity>
        )}

        <View style={styles.heroContent}>
          <Image
            source={require("@/assets/logos/eventful-logo.png")}
            style={styles.logo}
          />
          <Text type="title" color={colors.white} center>
            {title}
          </Text>
          <Text type="body" color={colors.white} center>
            {subtitle}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.panel}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: contentPaddingBottom }
          ]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        {footer && (
          <View
            onLayout={handleFooterLayout}
            style={[
              styles.footer,
              { paddingBottom: 16 + safeArea.paddingBottom }
            ]}
          >
            {footer}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    left: 12,
    position: "absolute",
    width: 44
  },
  container: {
    backgroundColor: colors.primary,
    flex: 1
  },
  content: {
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 32
  },
  footer: {
    backgroundColor: colors.white,
    bottom: 0,
    left: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    position: "absolute",
    right: 0
  },
  hero: {
    height: HERO_HEIGHT
  },
  heroContent: {
    alignItems: "center",
    bottom: PANEL_OVERLAP + 24,
    gap: 10,
    left: 24,
    position: "absolute",
    right: 24
  },
  logo: {
    ...shadows.mediumShadow,
    borderRadius: 15,
    height: 64,
    width: 64
  },
  overlay: {
    backgroundColor: colors.blackTransparent,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  panel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: PANEL_OVERLAP,
    flex: 1,
    marginTop: -PANEL_OVERLAP,
    overflow: "hidden"
  }
});
