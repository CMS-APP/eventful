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
  readUpdateNotification
} from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { InAppNotification } from "@/types/InAppNotification";

import { HomeUpdateItem } from "../components/HomeUpdateItem";

interface HomeUpdatesScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<HomeStackParamList, "HomeUpdates">;
}

export function HomeUpdatesScreen({
  navigation,
  route
}: HomeUpdatesScreenProps) {
  const { updates } = route.params || [];
  const userId = useSelector((state: UserState) => state.uid);

  const markUpdatesAsRead = useCallback(async () => {
    const unread = updates.filter((update) => !update.read);
    if (unread.length === 0) return;

    for (const update of unread) {
      await readUpdateNotification(update.id);
    }

    if (userId) {
      await decrementUnreadNotificationCount(userId, unread.length);
    }
  }, [updates, userId]);

  useEffect(() => {
    markUpdatesAsRead();
  }, [updates, markUpdatesAsRead]);

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Updates",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "bell",
          backAction: true
        }
      }}
      contentConfig={{
        tabBarPresent: true
      }}
    >
      <View style={styles.container}>
        {updates && updates.length !== 0 ? (
          updates.map((update: InAppNotification) => (
            <HomeUpdateItem key={update.id} update={update} />
          ))
        ) : (
          <EmptyStateContainer
            title="No New Updates"
            description="Come back later to check for updates."
            icon="bell"
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
