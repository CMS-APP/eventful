import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { SmallButton } from "@/components/buttons/SmallButton";
import { ArcCutout } from "@/components/views/ArcCutout";
import { FollowButton } from "@/components/views/FollowButton";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { ProfileStackParamList } from "@/features/app/navigationTypes";
import {
  getUserFollowers,
  getUserFollowing,
  isFollowingUser
} from "@/services/firebase/firebaseUserFunctions";
import { UserState } from "@/store/UserSlice";
import { Follower } from "@/types/Follower";
import { User } from "@/types/User";
import { getHitSlop } from "@/utils/hitSlop";

import { ProfilePicture } from "./ProfilePicture";

export function ProfileTop({ user }: { user: User }) {
  const userId = useSelector((state: UserState) => state.uid);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);

  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList>>();

  const checkIsFollowing = useCallback(async () => {
    const isFollowing = await isFollowingUser(userId, user.uid);
    setIsFollowing(isFollowing);
  }, [userId, user.uid]);

  const getUsers = useCallback(async () => {
    const followers = await getUserFollowers(user.uid);
    const following = await getUserFollowing(user.uid);
    setFollowers(followers);
    setFollowing(following);
  }, [user.uid]);

  useEffect(() => {
    getUsers();
    checkIsFollowing();
  }, [getUsers, checkIsFollowing]);

  function followText(title: string, length: number) {
    return (
      <TouchableOpacity
        style={styles.followButton}
        onPress={() =>
          (
            navigation as any as StackNavigationProp<ProfileStackParamList>
          ).navigate("ProfileFollowers", { user, type: title })
        }
        hitSlop={getHitSlop("large")}
      >
        <View style={styles.followButtonContent}>
          <Text type="body" color={colors.white}>
            {title}
          </Text>
          <Text type="subHeader" color={colors.white}>
            {length}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  function inviteToEvent() {
    navigation.navigate("ProfileInvite", { user: user as User });
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        {followText("Followers", followers.length)}
        <ProfilePicture user={user} size={100} />
        {followText("Following", following.length)}
      </View>

      <View style={styles.nameContainer}>
        <Text type="subHeader" color={colors.white}>
          {user.name}
        </Text>
        <Text type="body" color={colors.gray}>
          Username: {user.username}
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <FollowButton user={user} flex={1} />

        {isFollowing && (
          <SmallButton
            text="Invite To Event"
            onPress={inviteToEvent}
            color={colors.primaryTint}
            textColor={colors.white}
            textAlign="center"
            flex={1}
          />
        )}
      </View>

      <View style={styles.arcCutout}>
        <ArcCutout color={colors.white} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arcCutout: {
    bottom: 40,
    position: "absolute",
    right: 0
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginHorizontal: 24,
    marginTop: 24
  },
  container: {
    backgroundColor: colors.primary,
    paddingBottom: 24
  },
  followButton: {
    flex: 1
  },
  followButtonContent: {
    alignItems: "center"
  },
  nameContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  statsContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20
  }
});
