import { useSelector } from "react-redux";

import { useCallback, useRef } from "react";

import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { NavigationState, StackActions } from "@react-navigation/native";

import { colors } from "@/design-system/tokens/colors";
import { useSafeAreaStyles } from "@/design-system/tokens/globalStyles";
import { MainStackParamList } from "@/features/app/navigationTypes";
import { useNotifications } from "@/services/notifications";
import { UserState } from "@/store/UserSlice";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

import { MainTabBarIcon } from "./MainTabBarIcon";

interface MainTabBarProps {
  state: BottomTabBarProps["state"];
  navigation: BottomTabBarProps["navigation"];
}

export function MainTabBar({ state, navigation }: MainTabBarProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const notifications = useNotifications(userId);
  const safeArea = useSafeAreaStyles().safeArea;

  const isPhotoBoothActive = state.routes.some((route) =>
    route.state?.routes?.some(
      (nestedRoute) => nestedRoute.name === "PhotoBooth"
    )
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

  if (isPhotoBoothActive || hasModalActive) {
    return null;
  }

  const mainContainerStyle = {
    ...styles.mainContainer,
    height: 48 + safeArea.paddingBottom
  };

  return (
    <View style={mainContainerStyle}>
      {state.routes.map((route, index: number) => {
        const isFocused = state.index === index;
        const scale = scaleValues[index];

        return (
          <TouchableOpacity
            key={route.name}
            style={styles.mainItemContainer}
            onPress={() => onPress(route, isFocused, scale)}
            hitSlop={getHitSlop("medium")}
          >
            <Animated.View style={{ transform: [{ scale }] }}>
              <MainTabBarIcon
                route={route.name}
                isFocused={isFocused}
                notifications={
                  notifications[route.name as keyof typeof notifications] || 0
                }
              />
            </Animated.View>
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
    paddingBottom: 0,
    paddingHorizontal: 12,
    position: "absolute",
    width: "100%"
  },
  mainItemContainer: {
    alignItems: "center",
    flex: 1,
    padding: 12
  }
});
