import { StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { FlatHeader } from "@/components/views/screen/FlatHeader";
import { colors } from "@/design-system/tokens/colors";
import { EventInviteStackParamList } from "@/features/app/navigationTypes";
import { ItineraryList } from "@/features/events/components/edit/components/itinerary/ItineraryList";

type Props = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteItinerary"
>;

export function EventInviteItineraryScreen({ route }: Props) {
  const { event } = route.params;

  const headerConfig = {
    title: "Itinerary",
    backgroundColor: colors.primary,
    dark: true,
    backAction: true,
    icon: "calendar"
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
        </View>

        <ItineraryList
          event={event}
          itinerary={event.itinerary || []}
          onActivityPress={() => {}}
          theme="light"
          disabled={true}
        />
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
    paddingTop: 24
  }
});
