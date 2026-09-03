import { useSelector } from "react-redux";

import { useCallback, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationState, StackActions } from "@react-navigation/native";

import { useInAppNotificationBadges } from "@/app/hooks/useInAppNotificationBadges";
import { useSafeAreaStyles } from "@/app/hooks/useSafeAreaStyles";
import { MainStackParamList } from "@/app/navigation";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { UserState } from "@/store/UserSlice";
import { haptics } from "@/utils/haptics";

import { TabBarBorder } from "./TabBarBorder";
import { TabBarCamera } from "./TabBarCamera";
import { TabBarIcon } from "./TabBarIcon";

const RAISED_TAB_ROUTE_NAME = "PhotoBooth";

const FULL_SCREEN_ROUTE_NAMES = [
  "AccountPictureCamera",
  "PhotoBoothCamera",
  "PhotoBoothRedoPhoto"
];

function hasNestedRouteName(
  routes: NavigationState["routes"] | undefined,
  names: string[]
): boolean {
  if (!routes) return false;

  return routes.some((route) => {
    if (names.includes(route.name)) return true;
    const nestedState = route.state as NavigationState | undefined;
    return hasNestedRouteName(nestedState?.routes, names);
  });
}

interface TabBarProps {
  state: BottomTabBarProps["state"];
  navigation: BottomTabBarProps["navigation"];
}

export function TabBar({ state, navigation }: TabBarProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const photoBoothLocked = useSelector(
    (state: UserState) => state.photoBoothLocked
  );
  const premium = useSelector((state: UserState) => state.premium);
  const photoBooth = useSelector((state: UserState) => state.photoBooth);
  const hasPhotoBoothAccess = premium || photoBooth;
  const notifications = useInAppNotificationBadges(userId);
  const safeArea = useSafeAreaStyles().safeArea;
  const [barWidth, setBarWidth] = useState(Dimensions.get("window").width);

  const onBarLayout = useCallback((event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  }, []);

  const isFullScreenRouteActive = hasNestedRouteName(
    state.routes,
    FULL_SCREEN_ROUTE_NAMES
  );

  const modalScreenNames = [
    "CreatePoll",
    "CreatePost",
    "PhotoBoothPreviousPhoto"
  ];

  const hasModalActive = state.routes.some((route) => {
    const tabState = route.state as NavigationState | undefined;
    if (!tabState || tabState.index === 0) return false;
    const currentRoute = tabState.routes[tabState.index];
    return modalScreenNames.includes(currentRoute.name);
  });

  const scaleValues = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  const onPress = useCallback(
    (
      route: BottomTabBarProps["state"]["routes"][number],
      isFocused: boolean,
      scale: Animated.Value
    ) => {
      haptics.soft();

      const routeName = route.name as keyof MainStackParamList;

      const event = navigation.emit({
        type: "tabPress",
        target: routeName,
        canPreventDefault: true
      });

      if (!event.defaultPrevented) {
        if (isFocused) {
          const tabState = route.state as NavigationState | undefined;

          if (tabState && tabState.index > 0) {
            navigation.dispatch({
              ...StackActions.pop(1),
              target: tabState.key
            });
          }
        } else {
          navigation.navigate(routeName);
        }
      }

      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 50,
          useNativeDriver: true
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    },
    [navigation]
  );

  if (isFullScreenRouteActive || hasModalActive || photoBoothLocked) {
    return null;
  }

  const mainContainerStyle = {
    ...styles.mainContainer,
    height: 48 + safeArea.paddingBottom
  };

  return (
    <View style={mainContainerStyle} onLayout={onBarLayout}>
      <TabBarBorder width={barWidth} />

      {state.routes.map((route, index: number) => {
        const isFocused = state.index === index;
        const scale = scaleValues[index];
        const isRaised = route.name === RAISED_TAB_ROUTE_NAME;

        return (
          <TouchableOpacity
            key={route.name}
            style={styles.mainItemContainer}
            onPress={() => onPress(route, isFocused, scale)}
            hitSlop={getHitSlop("medium")}
          >
            {isRaised ? (
              <TabBarCamera scale={scale} hasAccess={hasPhotoBoothAccess} />
            ) : (
              <Animated.View style={{ transform: [{ scale }] }}>
                <TabBarIcon
                  route={route.name}
                  isFocused={isFocused}
                  notifications={
                    notifications[route.name as keyof typeof notifications] || 0
                  }
                />
              </Animated.View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.white,
    borderTopColor: colors.lightGray,
    borderTopWidth: 0.7,
    bottom: 0,
    flexDirection: "row",
    height: 72,
    position: "absolute",
    width: "100%"
  },
  mainItemContainer: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 12
  }
});
