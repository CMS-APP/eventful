import { StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { EventGuestListInvitedItem } from "@/features/invite/components/EventGuestListInvitedItem";

import { EventGuestList } from "../components/EventGuestList";

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
          title: "Attendees",
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
        <Text type="subHeader" color={colors.black}>
          Host:
        </Text>

        <EventGuestListInvitedItem
          user={host}
          invite={{
            id: host.uid,
            recipient: host.uid,
            sender: host.uid,
            eventId: event.id,
            response: "accept",
            dietary: ""
          }}
        />

        <EventGuestList event={event} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingHorizontal: 16
  }
});
