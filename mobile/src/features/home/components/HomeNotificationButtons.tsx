import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AppStackParamList, HomeStackParamList } from "@/app/navigation";
import { colors } from "@/design-system/tokens/colors";
import {
  listenToFollowNotifications,
  listenToUpdateNotifications
} from "@/services/firebase/notifications";
import { UserState } from "@/store/UserSlice";
import { InAppNotification } from "@/types/InAppNotification";

import { HomeNotificationButton } from "./HomeNotificationButton";

export function HomeNotificationButtons() {
  const userId = useSelector((state: UserState) => state.uid);
  const [updates, setUpdates] = useState<InAppNotification[]>([]);
  const [follows, setFollows] = useState<InAppNotification[]>([]);
  const [unreadFollows, setUnreadFollows] = useState(0);
  const [unreadUpdates, setUnreadUpdates] = useState(0);
  const navigation = useNavigation() as StackNavigationProp<HomeStackParamList>;
  const navRoot = useNavigation() as StackNavigationProp<AppStackParamList>;

  useEffect(() => {
    if (!userId) return;

    const unsubscribeFollows = listenToFollowNotifications(
      userId,
      (notifications: InAppNotification[]) => {
        setFollows(notifications);
        setUnreadFollows(
          notifications?.filter((notification) => !notification?.read).length ??
            0
        );
      }
    );

    const unsubscribeUpdates = listenToUpdateNotifications(
      userId,
      (updates: InAppNotification[]) => {
        setUpdates(updates);
        setUnreadUpdates(
          updates?.filter((notification) => !notification?.read).length ?? 0
        );
      }
    );

    return () => {
      unsubscribeFollows?.();
      unsubscribeUpdates?.();
    };
  }, [userId]);

  const handleFollowPress = useCallback(() => {
    navigation.navigate("HomeFollows", { follows });
  }, [navigation, follows]);

  const handleUpdatePress = useCallback(() => {
    navigation.navigate("HomeUpdates", { updates });
  }, [navigation, updates]);

  const handleFeedbackPress = useCallback(() => {
    navRoot.navigate("Feedback");
  }, [navRoot]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar} />

      <HomeNotificationButton
        onPress={handleUpdatePress}
        notifications={updates}
        icon="bell"
        text="Updates"
        unreadNotifications={unreadUpdates}
      />

      <HomeNotificationButton
        onPress={handleFollowPress}
        notifications={follows}
        icon="user-plus"
        text="Follows"
        unreadNotifications={unreadFollows}
      />

      <HomeNotificationButton
        onPress={handleFeedbackPress}
        notifications={[]}
        icon="comment"
        text="Feedback"
        unreadNotifications={0}
        dark
      />

      <View style={styles.bottomContainer}>
        <View style={styles.bottomBar} />
        <View style={styles.bottomCircle}>
          <View style={styles.innerCircle} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: colors.primaryTint,
    height: 24,
    width: 12
  },
  bottomCircle: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    transform: [{ translateY: -1 }],
    width: 24
  },
  bottomContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    alignItems: "center",
    gap: 8,
    position: "absolute",
    right: -14,
    top: -30,
    width: 70
  },
  innerCircle: {
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 15,
    width: 16
  },
  topBar: {
    backgroundColor: colors.primaryTint,
    width: 12
  }
});
