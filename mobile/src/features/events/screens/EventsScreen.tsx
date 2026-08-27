import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, EventsStackParamList } from "@/app/navigationTypes";
import { Screen } from "@/components/screen/Screen";
import { AppButtonSwitcher } from "@/design-system/components/AppButtonSwitcher";
import { IconButton } from "@/design-system/components/IconButton";
import { colors } from "@/design-system/tokens/colors";
import { getData, saveData } from "@/services/async";
import { useScreenStatusBar } from "@/utils/statusBar";

import { CreateEventModal } from "../components/create/CreateEventModal";
import { EventsList } from "../components/list/EventsList";
import { useEventList } from "../hooks/useEventList";

interface EventsScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventsList">;
}

export function EventsScreen({ navigation, route }: EventsScreenProps) {
  const [viewType, setViewType] = useState("List");
  const [selectedButton, setSelectedButton] = useState("Upcoming");
  const [showModal, setShowModal] = useState(false);

  const { upcomingEvents, pastEvents, declineEvents } =
    useEventList(navigation);
  useScreenStatusBar(true);

  useEffect(() => {
    if (route.params?.newEvent) {
      setShowModal(true);
    }
  }, [route]);

  function newEventAction() {
    setShowModal(true);
  }

  async function switchView() {
    setViewType((prev) => (prev === "List" ? "Grid" : "List"));
    await saveData("eventsViewType", viewType === "List" ? "Grid" : "List");
  }

  useEffect(() => {
    async function getViewType() {
      const viewType = await getData("eventsViewType");
      if (viewType) {
        setViewType(viewType);
      } else {
        setViewType("List");
      }
    }
    getViewType();
  }, []);

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
              iconName={viewType === "List" ? "list" : "th-large"}
              onPress={switchView}
              size="small"
              color={colors.primary}
              marginTop={0}
              marginBottom={0}
            />
            <IconButton
              iconName="plus"
              onPress={newEventAction}
              size="small"
              color={colors.primary}
              marginTop={0}
              marginBottom={0}
            />
          </View>

          <AppButtonSwitcher
            selections={["Upcoming", "Past", "Declined"]}
            selectedButton={selectedButton}
            setSelectedButton={setSelectedButton}
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
        viewType={viewType}
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
    gap: 12,
    marginHorizontal: 24,
    marginVertical: 20
  }
});
