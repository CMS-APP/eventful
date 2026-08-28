import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { Alert, View } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import {
  followUser,
  getUserFollowers,
  getUserFollowing,
  unFollowUser
} from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { Follower } from "@/types/Follower";
import { User } from "@/types/User";
import { haptics } from "@/utils/haptics";

interface FollowButtonProps {
  user: User;
  flex?: number | undefined;
}

export function FollowButton({ user, flex = undefined }: FollowButtonProps) {
  const [contactText, setContactText] = useState("Follow");
  const [following, setFollowing] = useState<Follower[]>([]);
  const userId = useSelector((state: UserState) => state.uid);

  const getContactText = useCallback(
    async (followers: Follower[], following: Follower[]) => {
      const isFollowingMe = following.some(
        (follow) => follow.followingId === userId && follow.status === "active"
      );
      const isFollowing = followers.some(
        (follower) =>
          follower.followerId === userId && follower.status === "active"
      );

      if (isFollowing) {
        setContactText("Following");
      } else if (isFollowingMe) {
        setContactText("Follow Back");
      } else {
        setContactText("Follow");
      }
    },
    [userId]
  );

  const handleUnfollow = useCallback(async () => {
    try {
      await unFollowUser(userId, user.uid);
      haptics.error();
      setFollowing(
        following.filter((follow) => follow.followingId !== user.uid)
      );
    } catch {
      // ignore
    }
  }, [userId, user.uid, following]);

  const unFollowUserAlert = useCallback(async () => {
    haptics.error();
    Alert.alert(
      "Unfollow User",
      "Are you sure you want to unfollow this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unfollows",
          style: "destructive",
          onPress: handleUnfollow
        }
      ]
    );
  }, [handleUnfollow]);

  const fetchData = useCallback(async () => {
    const followers = await getUserFollowers(user.uid);
    const following = await getUserFollowing(user.uid);
    setFollowing(following);
    getContactText(followers, following);
  }, [user.uid, getContactText]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePress = useCallback(async () => {
    if (contactText === "Follow" || contactText === "Follow Back") {
      haptics.success();
      setContactText("Following");
      await followUser(userId, user.uid);
    } else {
      await unFollowUserAlert();
    }
  }, [contactText, userId, user.uid, unFollowUserAlert]);

  if (user.uid === userId) {
    return null;
  }

  return (
    <View style={flex ? { flex: flex } : undefined}>
      <Button
        size="small"
        text={contactText}
        onPress={handlePress}
        color={colors.secondary}
        textColor={colors.white}
        flex={flex}
      />
    </View>
  );
}
