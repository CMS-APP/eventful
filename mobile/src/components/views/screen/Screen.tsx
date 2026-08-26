import { type ReactNode, useState } from "react";

import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View
} from "react-native";

import { colors } from "@/design-system/tokens/colors";
import { useSafeAreaStyles } from "@/hooks/useSafeAreaStyles";

import { AccountButton } from "../../buttons/AccountButton";
import { FootNote } from "../Footnote";
import { KeyboardScrollView } from "../KeyboardScrollView";
import { CurvyHeader } from "./CurvyHeader";
import { FlatHeader } from "./FlatHeader";
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
  backgroundColor?: string;
}

interface NonScrollProps {
  paddingTop?: number;
}

interface ScreenProps {
  children?: ReactNode;
  headerConfig?: HeaderProps;
  contentConfig?: ContentProps;
  nonScrollConfig?: NonScrollProps;
  nonScrollChildren?: ReactNode;
  handleScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function Screen({
  children,
  headerConfig,
  contentConfig = {
    tabBarPresent: true
  },
  nonScrollChildren,
  nonScrollConfig,
  handleScroll
}: ScreenProps) {
  const [scrollY, setScrollY] = useState(0);
  const safeArea = useSafeAreaStyles().safeArea;

  function _handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setScrollY(event.nativeEvent.contentOffset.y);
  }

  const containerStyle = {
    ...styles.root,
    backgroundColor: headerConfig?.backgroundColor || colors.primary,
    paddingTop: headerConfig?.modal ? 24 : safeArea.paddingTop
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
