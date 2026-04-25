import { useCallback, useEffect } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { Screen } from "@/components/views/screen/Screen";
import {
  AllStackParamList,
  HomeStackParamList
} from "@/features/app/navigationTypes";
import { readFollowNotification } from "@/services/firebase/firebaseUserFunctions";
import { colors } from "@/styles/colors";
import { Notification } from "@/types/Notification";

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

  const markFollowsAsRead = useCallback(async () => {
    if (follows.length !== 0) {
      for (const notification of follows) {
        await readFollowNotification(notification.id);
      }
    }
  }, [follows]);

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
          follows.map((not: Notification) => (
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
