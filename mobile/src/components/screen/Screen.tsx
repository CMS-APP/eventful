import { type ReactNode, useState } from "react";

import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  View
} from "react-native";

import { BlurView } from "expo-blur";

import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { colors } from "@/design-system/tokens/colors";

import { AccountButton } from "../../features/account/components/AccountButton";
import { KeyboardScrollView } from "../views/KeyboardScrollView";
import { CurvyHeader } from "./CurvyHeader";
import { FlatHeader } from "./FlatHeader";
import { FootNote } from "./Footnote";
import { CurvyHeaderProps, FlatHeaderProps } from "./props";

interface HeaderProps {
  type: "curvy" | "flat";
  backgroundColor?: string;
  modal?: boolean;
  flatHeaderProps?: FlatHeaderProps;
  curvyHeaderProps?: CurvyHeaderProps;
}

interface ContentProps {
  tabBarPresent?: boolean;
  paddingBottom?: number;
  backgroundColor?: string;
  bottomMargin?: boolean;
}

interface NonScrollProps {
  paddingTop?: number;
}

interface BlurOverlayProps {
  visible: boolean;
  intensity?: number;
  tint?: "light" | "dark" | "default";
  children?: ReactNode;
}

interface ScreenProps {
  children?: ReactNode;
  headerConfig?: HeaderProps;
  contentConfig?: ContentProps;
  nonScrollConfig?: NonScrollProps;
  nonScrollChildren?: ReactNode;
  handleScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  blurOverlay?: BlurOverlayProps;
}

export function Screen({
  children,
  headerConfig,
  contentConfig = {
    tabBarPresent: true,
    paddingBottom: 24,
    bottomMargin: true
  },
  nonScrollChildren,
  nonScrollConfig,
  handleScroll,
  blurOverlay
}: ScreenProps) {
  const [scrollY, setScrollY] = useState(0);
  const safeArea = useSafeAreaStyles().safeArea;

  function _handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setScrollY(event.nativeEvent.contentOffset.y);
  }

  const containerStyle = {
    ...styles.root,
    backgroundColor: headerConfig?.backgroundColor || colors.primary,
    paddingTop:
      headerConfig?.modal && Platform.OS === "ios" ? 24 : safeArea.paddingTop
  };

  const contentStyle = {
    ...styles.content,
    backgroundColor: contentConfig?.backgroundColor || colors.white
  };

  const nonScrollChildrenContainerStyle = {
    paddingTop: nonScrollConfig?.paddingTop ?? 0
  };

  return (
    <View style={containerStyle}>
      <View style={styles.headerContainer}>
        {headerConfig?.type === "curvy" && (
          <>
            <CurvyHeader
              {...(headerConfig?.curvyHeaderProps as CurvyHeaderProps)}
            />
            {(headerConfig?.curvyHeaderProps?.accountButton ?? true) && (
              <AccountButton />
            )}

            <View style={styles.footNoteContainer}>
              <FootNote
                icon={headerConfig?.curvyHeaderProps?.icon || undefined}
                color={colors.secondary}
                colorLeft={colors.secondaryDark}
              />
            </View>
          </>
        )}
      </View>

      <View style={contentStyle}>
        {nonScrollChildren && (
          <View style={nonScrollChildrenContainerStyle}>
            {nonScrollChildren}
          </View>
        )}
        <KeyboardScrollView
          tabBarPresent={contentConfig?.tabBarPresent ?? true}
          handleScroll={handleScroll ?? (() => {})}
          _handleScroll={_handleScroll}
          backgroundColor={contentConfig?.backgroundColor}
          paddingBottom={contentConfig?.paddingBottom ?? 24}
          bottomMargin={contentConfig?.bottomMargin ?? true}
        >
          {headerConfig?.type === "flat" && (
            <>
              <View
                style={[
                  styles.animatedBackground,
                  {
                    backgroundColor: headerConfig?.backgroundColor,
                    height: -scrollY + 100,
                    top: scrollY - 100
                  }
                ]}
              />
              <FlatHeader
                {...(headerConfig?.flatHeaderProps as FlatHeaderProps)}
                backgroundColor={headerConfig?.backgroundColor}
              />
            </>
          )}
          {children}
        </KeyboardScrollView>
      </View>

      {blurOverlay?.visible && (
        <>
          <BlurView
            intensity={blurOverlay.intensity ?? 40}
            tint={blurOverlay.tint ?? "light"}
            experimentalBlurMethod={
              Platform.OS === "android" ? "dimezisBlurView" : undefined
            }
            style={styles.blurOverlay}
            pointerEvents="none"
          />

          {blurOverlay.children && (
            <View style={styles.blurOverlayContent}>
              {blurOverlay.children}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  animatedBackground: {
    left: 0,
    opacity: 1,
    position: "absolute",
    right: 0,
    zIndex: 0
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000
  },
  blurOverlayContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 2001
  },
  content: {
    flex: 1
  },
  footNoteContainer: {
    bottom: -40,
    position: "absolute",
    zIndex: 1000
  },
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  root: {
    flex: 1
  }
});
