import { useCallback, useEffect } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, HomeStackParamList } from "@/app/navigationTypes";
import { Screen } from "@/components/screen/Screen";
import { EmptyStateContainer } from "@/components/views/EmptyStateContainer";
import { colors } from "@/design-system/tokens/colors";
import { readUpdateNotification } from "@/services/firebase/firebaseUserFunctions";
import { Notification } from "@/types/Notification";

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

  const markUpdatesAsRead = useCallback(async () => {
    if (updates.length !== 0) {
      for (const update of updates) {
        await readUpdateNotification(update.id);
      }
    }
  }, [updates]);

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
          updates.map((update: Notification) => (
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
