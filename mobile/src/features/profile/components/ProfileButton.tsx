import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { Text } from "@/components/text/Text";
import { FollowButton } from "@/components/views/FollowButton";
import { HomeStackParamList } from "@/features/app/navigationTypes";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { User } from "@/types/User";
import { getHitSlop } from "@/utils/hitSlop";

import { ProfilePicture } from "./ProfilePicture";

interface ProfileButtonProps {
  uid: string;
}

export function ProfileButton({ uid }: ProfileButtonProps) {
  const [user, setUser] = useState<User | null>(null);
  const userId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation() as StackNavigationProp<HomeStackParamList>;

  async function fetchUser() {
    const user = await getUserInfo(uid);
    setUser(user);
  }

  useEffect(() => {
    fetchUser();
  }, [uid]);

  const handleActionPress = useCallback(() => {
    if (user) {
      navigation.navigate("Profile", {
        screen: "ProfileView",
        params: { user }
      });
    }
  }, [user, navigation]);

  if (!user) {
    return <ActivityIndicator size="small" color={colors.secondary} />;
  }

  return (
    <TouchableOpacity
      onPress={handleActionPress}
      hitSlop={getHitSlop("medium")}
    >
      <View style={[globalStyles.mediumWidget, styles.container]}>
        <ProfilePicture user={user} size={40} />
        <View style={styles.contentContainer}>
          <Text type="body">{user.name}</Text>
          <Text type="body" style={styles.username}>
            {user.username}
          </Text>
        </View>

        {user.uid !== userId && <FollowButton user={user} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.lightGray,
    flexDirection: "row",
    gap: 12
  },
  contentContainer: {
    alignItems: "flex-start",
    flex: 1
  },
  username: {
    color: colors.gray
  }
});
