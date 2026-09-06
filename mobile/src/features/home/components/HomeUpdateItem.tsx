import { useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { HomeStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { getUserInfo } from "@/services/firebase/user";
import { InAppNotification } from "@/types/InAppNotification";
import { User } from "@/types/User";

interface HomeUpdateItemProps {
  update: InAppNotification;
}

export function HomeUpdateItem({ update }: HomeUpdateItemProps) {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const navigation = useNavigation() as StackNavigationProp<HomeStackParamList>;

  useEffect(() => {
    async function fetchUserDetails() {
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
    padding.mediumWidget,
    styles.container,
    {
      borderWidth: update.read ? 0 : 1
    }
  ];

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("medium")}>
      <View style={widgetStyle}>
        <ProfilePicture user={userDetails as User} size={36} />
        <View style={styles.contentContainer}>
          <Text type="subHeader">{update.title}</Text>
          <Text type="caption" color={colors.gray}>
            {update.body}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    borderColor: colors.secondary,
    flexDirection: "row",
    gap: 12
  },
  contentContainer: {
    alignItems: "flex-start",
    flex: 1
  }
});
