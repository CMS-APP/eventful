import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { ProfilePicture } from "@/features/profile/components/ProfilePicture";
import { getEventRecipientInvites } from "@/services/firebase/firebaseInviteFunctions";
import { getUserInfo } from "@/services/firebase/firebaseUserFunctions";
import { Event } from "@/types/Event";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";

interface InviteProfilePicturesProps {
  event: Event;
}

export function InviteProfilePictures({ event }: InviteProfilePicturesProps) {
  const [users, setUsers] = useState<User[]>([]);
  const maxDisplayUsers = 4;
  const [remainder, setRemainder] = useState(0);

  useEffect(() => {
    async function fetchInvites() {
      const invites = await getEventRecipientInvites(event.id);
      const userPromises = invites.map((invite: Invite) =>
        getUserInfo(invite.recipient)
      );
      const users = await Promise.all(userPromises);

      if (users.length > maxDisplayUsers) {
        setUsers(users.slice(0, maxDisplayUsers) as User[]);
        setRemainder(users.length - maxDisplayUsers);
      } else {
        setUsers(users as User[]);
      }
    }
    fetchInvites();
  }, [event]);

  return (
    <View style={styles.container}>
      <Text type="body">Going</Text>
      <View style={styles.picturesRow}>
        {users.map((user: User) => (
          <ProfilePicture key={user.uid} user={user} size={30} />
        ))}

        {users.length === 0 && (
          <View style={styles.placeholderContainer}>
            <FontAwesome5 name="user-plus" size={20} color={colors.white} />
          </View>
        )}

        {remainder > 0 && (
          <View style={styles.remainderContainer}>
            <Text type="body" color="white">
              +{remainder}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2.5,
    justifyContent: "flex-end"
  },
  picturesRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  placeholderContainer: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 30,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  remainderContainer: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 30,
    height: 30,
    justifyContent: "center",
    width: 30
  }
});
