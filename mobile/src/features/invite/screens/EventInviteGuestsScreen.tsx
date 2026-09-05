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
        backgroundColor: colors.primary,
        flatHeaderProps: {
          title: "Guests",
          backgroundColor: colors.primary,
          dark: true,
          backAction: true,
          icon: "users"
        }
      }}
      contentConfig={{
        backgroundColor: colors.primary,
        tabBarPresent: false
      }}
    >
      <EventGuestListInvited event={event} host={host} />
      <InviteLinkGuests event={event} />
    </Screen>
  );
}
