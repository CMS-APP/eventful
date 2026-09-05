import { useCallback, useEffect, useState } from "react";

import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { syncUserPicture } from "@/services/local/cache";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { haptics } from "@/utils/haptics";

interface EventGuestListInvitedItemProps {
  user: User;
  invite: Invite;
}

export function EventGuestListInvitedItem({
  user,
  invite
}: EventGuestListInvitedItemProps) {
  const name = user.name;
  const response = invite.response === "pending" ? "maybe" : invite.response;
  const [userImage, setUserImage] = useState<string | null>(null);
  const navigation =
    useNavigation<NativeStackNavigationProp<EventInviteStackParamList>>();

  const fetchUserImage = useCallback(async () => {
    const imageUri = await syncUserPicture(user);
    setUserImage(imageUri ?? null);
  }, [user]);

  useEffect(() => {
    fetchUserImage();
  }, [fetchUserImage]);

  const viewProfile = useCallback(() => {
    navigation.navigate("Profile", {
      screen: "ProfileView",
      params: { user }
    });
  }, [user, navigation]);

  const responseColor = useCallback(() => {
    if (response === "accept") {
      return colors.primary;
    } else if (response === "maybe") {
      return colors.secondary;
    } else if (response === "decline") {
      return colors.tertiary;
    }
  }, [response]);

  return (
    <TouchableOpacity
      onPress={() => {
        haptics.soft();
        viewProfile();
      }}
      hitSlop={getHitSlop("medium")}
    >
      <View style={styles.userContainer}>
        <View style={styles.imageContainer}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.image} />
          ) : (
            <Text style={styles.initial}>{user.name[0].toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text type="body">{name}</Text>
          <Text type="body" italic style={styles.usernameText}>
            {user.username}
          </Text>

          {invite.dietary && (
            <Text type="body" italic style={styles.dietaryText}>
              Food: {invite.dietary}
            </Text>
          )}
        </View>
        <View style={[styles.button, { backgroundColor: responseColor() }]}>
          <Text type="body" color="white" style={styles.responseText}>
            {response}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    ...padding.smallWidget,
    backgroundColor: colors.primary
  },
  dietaryText: {
    color: colors.gray,
    fontSize: 10,
    textTransform: "capitalize"
  },
  image: {
    borderRadius: 24,
    height: 40,
    width: 40
  },
  imageContainer: {
    backgroundColor: colors.primaryTint,
    borderRadius: 24,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  initial: {
    color: colors.white,
    textAlign: "center"
  },
  responseText: {
    textAlign: "right"
  },
  textContainer: {
    flex: 1
  },
  userContainer: {
    ...padding.mediumWidget,
    backgroundColor: colors.lightGray,
    flexDirection: "row",
    gap: 12
  },
  usernameText: {
    color: colors.gray,
    fontSize: 10,
    textTransform: "lowercase"
  }
});
