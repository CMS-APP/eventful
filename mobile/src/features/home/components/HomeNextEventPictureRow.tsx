import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { ContactIcon } from "@/features/home/components/ContactIcon";
import { UserInvite } from "@/types/UserInvite";

interface HomeNextEventPictureRowProps {
  accepted: UserInvite[];
}

export function HomeNextEventPictureRow({
  accepted
}: HomeNextEventPictureRowProps) {
  const maxCount = 4;
  const count = accepted.length;

  if (count <= maxCount) {
    return (
      <View style={styles.container}>
        {accepted.map((guest) => (
          <ContactIcon
            user={guest.user}
            type={guest.invite.type}
            key={guest.invite.id}
            size={40}
          />
        ))}
      </View>
    );
  } else {
    const remaining = count - maxCount;
    const finalAccept = accepted.slice(0, maxCount);
    return (
      <View style={styles.container}>
        {finalAccept.map((guest) => (
          <ContactIcon
            user={guest.user}
            type={guest.invite.type}
            key={guest.invite.id}
            size={40}
          />
        ))}

        <View style={styles.remainingContainer}>
          <Text type="body" color="white">
            +{remaining}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12
  },
  remainingContainer: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 24,
    height: 40,
    justifyContent: "center",
    width: 40
  }
});
