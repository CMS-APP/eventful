import { useState } from "react";

import { StackNavigationProp } from "@react-navigation/stack";

import { AppButtonSwitcher } from "@/components/buttons/AppButtonSwitcher";
import { Screen } from "@/components/views/screen/Screen";
import { AllStackParamList } from "@/features/app/navigationTypes";
import { InvitesView } from "@/features/events/components/invite/InvitesView";
import { colors } from "@/styles/colors";

import { useEventInvites } from "../hooks/useEventInvites";

interface ContactsInvitationScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function ContactsInvitationScreen({
  navigation
}: ContactsInvitationScreenProps) {
  const [selectedButton, setSelectedButton] = useState("Upcoming");
  const { upcomingEvents, pastEvents } = useEventInvites(navigation);

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Contacts",
          subTitle: "Invites",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "inbox",
          backAction: true
        }
      }}
      nonScrollConfig={{
        paddingTop: 48
      }}
      nonScrollChildren={
        <AppButtonSwitcher
          selections={["Upcoming", "Past"]}
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
          nonPressColor={colors.gray}
        />
      }
    >
      <InvitesView
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        selectedButton={selectedButton}
      />
    </Screen>
  );
}
