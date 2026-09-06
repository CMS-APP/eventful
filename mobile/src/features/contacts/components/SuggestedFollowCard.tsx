import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { HomeStackParamList } from "@/app/navigation";
import { FollowButton } from "@/components/views/FollowButton";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { getUserInfo } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { User } from "@/types/User";

interface SuggestedFollowCardProps {
  uid: string;
}

export function SuggestedFollowCard({ uid }: SuggestedFollowCardProps) {
  const [user, setUser] = useState<User | null>(null);
  const userId = useSelector((state: UserState) => state.uid);
  const navigation = useNavigation() as StackNavigationProp<HomeStackParamList>;

  useEffect(() => {
    getUserInfo(uid).then(setUser);
  }, [uid]);

  const handlePress = useCallback(() => {
    if (user) {
      navigation.navigate("Profile", {
        screen: "ProfileView",
        params: { user }
      });
    }
  }, [user, navigation]);

  if (!user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={colors.secondary} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={getHitSlop("medium")}
      style={styles.container}
    >
      <ProfilePicture user={user} size={36} />
      <View style={styles.nameContainer}>
        <Text type="body" numberOfLines={1} style={styles.name}>
          {user.name}
        </Text>
        <Text type="caption" numberOfLines={1} style={styles.username}>
          {user.username}
        </Text>
      </View>

      {user.uid !== userId && (
        <View style={styles.followButtonWrapper}>
          <FollowButton user={user} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    alignItems: "center",
    gap: 8,
    padding: 12,
    width: 132
  },
  followButtonWrapper: {
    width: "100%"
  },
  loadingContainer: {
    height: 190,
    justifyContent: "center"
  },
  name: {
    textAlign: "center",
    width: "100%"
  },
  nameContainer: {
    alignItems: "center",
    gap: 0,
    width: "100%"
  },
  username: {
    color: colors.gray,
    textAlign: "center",
    width: "100%"
  }
});
