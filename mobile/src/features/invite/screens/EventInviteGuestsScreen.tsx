import { StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { FlatHeader } from "@/components/views/screen/FlatHeader";
import { colors } from "@/design-system/tokens/colors";
import { EventInviteStackParamList } from "@/features/app/navigationTypes";
import { EventGuestListInvited } from "@/features/events/components/guest-list/EventGuestListInvited";

import { InviteLinkGuests } from "../components/InviteLinkGuests";

type Props = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteGuests"
>;

export function EventInviteGuestsScreen({ route }: Props) {
  const { event, host } = route.params;

  const headerConfig = {
    title: "Guests",
    backgroundColor: colors.primary,
    dark: true,
    backAction: true,
    icon: "users"
  };

  return (
    <View style={styles.container}>
      <KeyboardScrollView
        tabBarPresent={false}
        handleScroll={() => {}}
        _handleScroll={() => {}}
        backgroundColor={colors.primary}
      >
        <View style={styles.headerContainer}>
          <FlatHeader {...headerConfig} />
          <EventGuestListInvited event={event} host={host} />

          <InviteLinkGuests event={event} />
        </View>
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1
  },
  headerContainer: {
    flex: 1,
    paddingTop: 24
  }
});
