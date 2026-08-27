import { useCallback, useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AccountStackParamList } from "@/app/navigation";
import { FollowButton } from "@/components/views/FollowButton";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { InAppNotification } from "@/types/InAppNotification";
import { User } from "@/types/User";
import { haptics } from "@/utils/haptics";

interface HomeFollowsItemProps {
  notification: InAppNotification;
}

export function HomeFollowsItem({ notification }: HomeFollowsItemProps) {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const nav = useNavigation() as StackNavigationProp<AccountStackParamList>;

  useEffect(() => {
    async function fetchUserDetails() {
      const userDetails = await getUserInfo(notification.senderId);
      setUserDetails(userDetails);
    }
    fetchUserDetails();
  }, [notification.senderId]);

  const handlePress = useCallback(() => {
    haptics.soft();
    nav.navigate("Profile", {
      screen: "ProfileView",
      params: { user: userDetails as User, type: "profile" }
    });
  }, [nav, userDetails]);

  if (!userDetails) {
    return null;
  }

  const widgetStyle = [
    padding.mediumWidget,
    styles.container,
    {
      borderWidth: notification.read ? 0 : 1,
      borderColor: colors.secondary
    }
  ];

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("medium")}>
      <View style={widgetStyle}>
        <ProfilePicture user={userDetails} size={50} />
        <View style={styles.contentContainer}>
          <Text type="subHeader" style={styles.title}>
            {notification.title}
          </Text>
          <Text type="body" style={styles.body}>
            {notification.body}
          </Text>
        </View>

        <FollowButton user={userDetails} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.gray
  },
  container: {
    backgroundColor: colors.lightGray,
    flexDirection: "row",
    gap: 12
  },
  contentContainer: {
    alignItems: "flex-start",
    flex: 1
  },
  title: {
    textAlign: "left"
  }
});
