import { StyleSheet, View } from "react-native";

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
        backgroundColor: colors.white,
        flatHeaderProps: {
          title: "Itinerary",
          backgroundColor: colors.white,
          backAction: true,
          icon: "calendar"
        }
      }}
      contentConfig={{
        backgroundColor: colors.white,
        tabBarPresent: false
      }}
    >
      <View style={styles.container}>
        <ItineraryList
          event={event}
          itinerary={event.itinerary || []}
          onActivityPress={() => {}}
          theme="light"
          disabled={true}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 }
});
