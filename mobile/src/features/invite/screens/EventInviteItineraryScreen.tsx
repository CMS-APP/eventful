import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import { ItineraryList } from "@/features/events/components/edit/components/itinerary/ItineraryList";

type Props = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteItinerary"
>;

export function EventInviteItineraryScreen({ route }: Props) {
  const { event } = route.params;

  return (
    <Screen
      headerConfig={{
        type: "flat",
        backgroundColor: colors.primary,
        flatHeaderProps: {
          title: "Itinerary",
          backgroundColor: colors.primary,
          dark: true,
          backAction: true,
          icon: "calendar"
        }
      }}
      contentConfig={{
        backgroundColor: colors.primary,
        tabBarPresent: false
      }}
    >
      <ItineraryList
        event={event}
        itinerary={event.itinerary || []}
        onActivityPress={() => {}}
        theme="light"
        disabled={true}
      />
    </Screen>
  );
}
