import { useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { HomeStackParamList } from "@/app/navigationTypes";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { padding } from "@/design-system/tokens/padding";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { Notification } from "@/types/Notification";
import { User } from "@/types/User";
import { getHitSlop } from "@/utils/hitSlop";
import { log } from "@/utils/logging";

interface HomeUpdateItemProps {
  update: Notification;
}

export function HomeUpdateItem({ update }: HomeUpdateItemProps) {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const navigation = useNavigation() as StackNavigationProp<HomeStackParamList>;

  useEffect(() => {
    async function fetchUserDetails() {
      log("Fetching user details", "info");
      const userDetails = await getUserInfo(update.senderId);
      setUserDetails(userDetails);
    }
    fetchUserDetails();
  }, [update.senderId]);

  function handlePress() {
    if (userDetails) {
      navigation.navigate("Profile", {
        screen: "ProfileView",
        params: { user: userDetails }
      });
    }
  }

  const widgetStyle = [
    padding.largeWidget,
    styles.container,
    {
      borderWidth: update.read ? 0 : 1
    }
  ];

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("medium")}>
      <View style={widgetStyle}>
        <ProfilePicture user={userDetails as User} size={50} />
        <View style={styles.contentContainer}>
          <Text type="subHeader">{update.title}</Text>
          <Text type="body">{update.body}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    borderColor: colors.secondary,
    flexDirection: "row",
    gap: 12
  },
  contentContainer: {
    alignItems: "flex-start",
    flex: 1
  }
});
