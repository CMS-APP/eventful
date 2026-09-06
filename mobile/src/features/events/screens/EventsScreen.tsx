import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { IconButton } from "@/design-system/components/buttons/IconButton";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { colors } from "@/design-system/tokens/colors";

import { CreateEventModal } from "../components/create/CreateEventModal";
import { EventsList } from "../components/list/EventsList";
import { useEventList } from "../hooks/useEventList";

interface EventsScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventsList">;
}

export function EventsScreen({ navigation, route }: EventsScreenProps) {
  const [selectedButton, setSelectedButton] = useState("Upcoming");
  const [showModal, setShowModal] = useState(false);

  const { upcomingEvents, pastEvents, declineEvents } =
    useEventList(navigation);

  useEffect(() => {
    if (route.params?.newEvent) {
      setShowModal(true);
    }
  }, [route]);

  function newEventAction() {
    setShowModal(true);
  }

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Events",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "book"
        }
      }}
      nonScrollChildren={
        <>
          <View style={styles.viewSwitcherContainer}>
            <View style={styles.flexSpacer} />
            <IconButton
              iconName="plus"
              onPress={newEventAction}
              size="small"
              color={colors.primary}
              marginTop={0}
              marginBottom={0}
            />
          </View>

          <SegmentedControl
            selections={["Upcoming", "Past", "Declined"]}
            selectedButton={selectedButton}
            setSelectedButton={setSelectedButton}
            pressColor={colors.primary}
            nonPressColor={colors.gray}
          />
        </>
      }
    >
      <CreateEventModal showModal={showModal} setShowModal={setShowModal} />

      <EventsList
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        declineEvents={declineEvents}
        selectedButton={selectedButton}
        newEventAction={newEventAction}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flexSpacer: {
    flex: 1
  },
  viewSwitcherContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
    marginHorizontal: 24,
    marginTop: 20
  }
});
