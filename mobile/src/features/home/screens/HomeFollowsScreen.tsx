import { useSelector } from "react-redux";

import { useCallback, useEffect } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, HomeStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { colors } from "@/design-system/tokens/colors";
import {
  decrementUnreadNotificationCount,
  readFollowNotification
} from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { InAppNotification } from "@/types/InAppNotification";

import { HomeFollowsItem } from "../components/HomeFollowsItem";

interface HomeFollowsScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<HomeStackParamList, "HomeFollows">;
}

export function HomeFollowsScreen({
  navigation,
  route
}: HomeFollowsScreenProps) {
  const { follows } = route.params || [];
  const userId = useSelector((state: UserState) => state.uid);

  const markFollowsAsRead = useCallback(async () => {
    const unread = follows.filter((notification) => !notification.read);
    if (unread.length === 0) return;

    for (const notification of unread) {
      await readFollowNotification(notification.id);
    }

    if (userId) {
      await decrementUnreadNotificationCount(userId, unread.length);
    }
  }, [follows, userId]);

  useEffect(() => {
    markFollowsAsRead();
  }, [follows, markFollowsAsRead]);

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Follows",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "user-plus",
          backAction: true
        }
      }}
      contentConfig={{
        tabBarPresent: true
      }}
    >
      <View style={styles.container}>
        {follows.length !== 0 ? (
          follows.map((not: InAppNotification) => (
            <HomeFollowsItem key={not.id} notification={not} />
          ))
        ) : (
          <EmptyStateContainer
            title="No New Follows"
            description="Come back later to check for follows."
            icon="user-plus"
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    marginTop: 52,
    paddingHorizontal: 16
  }
});
