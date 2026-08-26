import { StyleSheet, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/design-system/tokens/colors";
import { Invite } from "@/types/Invite";

interface InviteEventCardResponseProps {
  invite: Invite;
}

export function InviteEventCardResponse({
  invite
}: InviteEventCardResponseProps) {
  const response = invite.response;

  return (
    <View style={styles.container}>
      <FontAwesome5
        name={response === "accept" ? "check" : "check-circle"}
        size={24}
        color={response === "accept" ? colors.primary : colors.gray}
      />
      <FontAwesome5
        name={
          response === "maybe" || response === "pending"
            ? "question"
            : "question-circle"
        }
        size={24}
        color={
          response === "maybe" || response === "pending"
            ? colors.secondary
            : colors.gray
        }
      />
      <FontAwesome5
        name={response === "decline" ? "times" : "times-circle"}
        size={24}
        color={response === "decline" ? colors.tertiary : colors.gray}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 12,
    marginLeft: 6
  }
});
