import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import { Button } from "@/design-system/components/buttons/Button";
import { colors } from "@/design-system/tokens/colors";
import {
  trackUserFollowed,
  trackUserUnfollowed
} from "@/services/analytics/events";
import {
  followUser,
  isFollowingUser,
  unFollowUser
} from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { User } from "@/types/User";
import { showOptionsAlert } from "@/utils/alertModal";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

interface FollowButtonProps {
  user: User;
  flex?: number | undefined;
  onFollowingChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  user,
  flex = undefined,
  onFollowingChange
}: FollowButtonProps) {
  const [contactText, setContactText] = useState("Follow");
  const [isFollowingMe, setIsFollowingMe] = useState(false);
  const userId = useSelector((state: UserState) => state.uid);

  const handleUnfollow = useCallback(async () => {
    try {
      await unFollowUser(userId, user.uid);
      trackUserUnfollowed();
      haptics.error();
      setContactText(isFollowingMe ? "Follow Back" : "Follow");
      onFollowingChange?.(false);
    } catch {
      log("Failed to unfollow user", "error");
      showErrorToast("Failed to unfollow user");
    }
  }, [userId, user.uid, isFollowingMe, onFollowingChange]);

  const unFollowUserAlert = useCallback(async () => {
    haptics.error();
    showOptionsAlert(
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
    const [isFollowing, followingMe] = await Promise.all([
      isFollowingUser(userId, user.uid),
      isFollowingUser(user.uid, userId)
    ]);

    setIsFollowingMe(followingMe);
    setContactText(
      isFollowing ? "Following" : followingMe ? "Follow Back" : "Follow"
    );
    onFollowingChange?.(isFollowing);
  }, [userId, user.uid, onFollowingChange]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handlePress = useCallback(async () => {
    if (contactText === "Follow" || contactText === "Follow Back") {
      haptics.success();
      setContactText("Following");
      onFollowingChange?.(true);
      await followUser(userId, user.uid);
      trackUserFollowed();
    } else {
      await unFollowUserAlert();
    }
  }, [contactText, userId, user.uid, unFollowUserAlert, onFollowingChange]);

  if (user.uid === userId) {
    return null;
  }

  return (
    <View style={flex ? { flex: flex } : undefined}>
      <Button
        size="small"
        text={contactText}
        onPress={handlePress}
        color={
          contactText === "Following" ? colors.primaryTint : colors.secondary
        }
        textColor={colors.white}
        flex={flex}
        leadingIcon={contactText === "Following" ? "check" : "user-plus"}
      />
    </View>
  );
}
