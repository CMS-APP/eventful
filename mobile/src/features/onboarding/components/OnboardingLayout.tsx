import type { ReactNode } from "react";

import {
  Image,
  type ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { StepDots } from "@/design-system/components/feedback/StepDots";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

const TOTAL_STEPS = 3;

interface OnboardingLayoutProps {
  step: number;
  onBack?: () => void;
  title: string;
  subtitle: string;
  image?: ImageSourcePropType;
  imageSize?: number;
  expandHero?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function OnboardingLayout({
  step,
  onBack,
  title,
  subtitle,
  image,
  imageSize = 120,
  expandHero = false,
  children,
  footer
}: OnboardingLayoutProps) {
  const { safeArea } = useSafeAreaStyles();
  const contentPaddingBottom = footer ? 40 : 56 + safeArea.paddingBottom;

  return (
    <View style={[styles.container, { paddingTop: safeArea.paddingTop }]}>
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={getHitSlop("medium")}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <FontAwesome5 name="arrow-left" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <StepDots
          step={step}
          total={TOTAL_STEPS}
          activeColor={colors.secondary}
          inactiveColor={colors.primaryTint3}
        />
        <View style={styles.backButton} />
      </View>

      <View style={[styles.hero, expandHero && styles.heroExpanded]}>
        {image && (
          <Image
            source={image}
            style={{ height: imageSize, width: imageSize }}
            resizeMode="contain"
          />
        )}
        <View style={styles.heroText}>
          <Text type="title" color={colors.white} center style={styles.title}>
            {title}
          </Text>
          <Text type="body" color={colors.white} center>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={[styles.sheet, !expandHero && styles.sheetExpanded]}>
        <KeyboardScrollView
          tabBarPresent={false}
          paddingBottom={contentPaddingBottom}
        >
          <View style={styles.sheetContent}>{children}</View>
        </KeyboardScrollView>

        {footer && (
          <View
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
    width: 44
  },
  container: {
    backgroundColor: colors.primary,
    flex: 1
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12
  },
  hero: {
    alignItems: "center",
    gap: 16,
    paddingBottom: 48,
    paddingHorizontal: 32,
    paddingTop: 8
  },
  heroExpanded: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 0
  },
  heroText: {
    alignItems: "center",
    gap: 6
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    overflow: "hidden"
  },
  sheetContent: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 32
  },
  sheetExpanded: {
    flex: 1
  },
  title: {
    fontSize: 32,
    lineHeight: 38
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    height: 44,
    justifyContent: "space-between",
    paddingHorizontal: 12
  }
});
