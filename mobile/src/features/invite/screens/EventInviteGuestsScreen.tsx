import { StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import { EventGuestListInvited } from "@/features/invite/components/EventGuestListInvited";

import { InviteLinkGuests } from "../components/InviteLinkGuests";

type Props = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteGuests"
>;

export function EventInviteGuestsScreen({ route }: Props) {
  const { event, host } = route.params;

  return (
    <Screen
      headerConfig={{
        type: "flat",
        backgroundColor: colors.white,
        flatHeaderProps: {
          title: "Guests",
          backgroundColor: colors.white,
          backAction: true,
          icon: "users"
        }
      }}
      contentConfig={{
        backgroundColor: colors.white,
        tabBarPresent: false
      }}
    >
      <View style={styles.container}>
        <EventGuestListInvited event={event} host={host} />
        <InviteLinkGuests event={event} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16
  }
});
