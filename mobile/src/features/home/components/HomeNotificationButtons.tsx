import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  HomeStackParamList,
  MainStackParamList
} from "@/features/app/navigationTypes";
import {
  listenToFollowNotifications,
  listenToUpdateNotifications
} from "@/services/firebase/firebaseNotification";
import { useNotifications } from "@/services/notifications";
import { UserState } from "@/store/UserSlice";
import { colors } from "@/styles/colors";
import { Notification } from "@/types/Notification";

import { HomeNotificationButton } from "./HomeNotificationButton";

export function HomeNotificationButtons() {
  const userId = useSelector((state: UserState) => state.uid);
  const [updates, setUpdates] = useState<Notification[]>([]);
  const [follows, setFollows] = useState<Notification[]>([]);
  const [unreadFollows, setUnreadFollows] = useState(0);
  const [unreadUpdates, setUnreadUpdates] = useState(0);
  const notifications = useNotifications(userId);
  const navigation = useNavigation() as StackNavigationProp<HomeStackParamList>;
  const navMain = useNavigation() as StackNavigationProp<MainStackParamList>;

  useEffect(() => {
    if (!userId) return;

    const unsubscribeFollows = listenToFollowNotifications(
      userId,
      (notifications: Notification[]) => {
        setFollows(notifications);
        setUnreadFollows(
          notifications?.filter((notification) => !notification?.read).length ??
            0
        );
      }
    );

    const unsubscribeUpdates = listenToUpdateNotifications(
      userId,
      (updates: Notification[]) => {
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

  const handleInvitePress = useCallback(() => {
    navMain.navigate("Contacts", {
      screen: "ContactsInvitations",
      params: undefined
    });
  }, [navigation]);

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
        onPress={handleInvitePress}
        notifications={[]}
        icon="inbox"
        text="Invites"
        unreadNotifications={notifications?.Contacts ?? 0}
      />

      <HomeNotificationButton
        onPress={handleFollowPress}
        notifications={follows}
        icon="user-plus"
        text="Follows"
        unreadNotifications={unreadFollows}
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
    height: 30,
    width: 10
  },
  bottomCircle: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 12,
    height: 25,
    justifyContent: "center",
    transform: [{ translateY: -1 }],
    width: 25
  },
  bottomContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    alignItems: "center",
    gap: 12,
    position: "absolute",
    right: -15,
    top: -30,
    width: 70
  },
  innerCircle: {
    backgroundColor: colors.white,
    borderRadius: 12,
    height: 15,
    width: 15
  },
  topBar: {
    backgroundColor: colors.primaryTint,
    width: 10
  }
});
