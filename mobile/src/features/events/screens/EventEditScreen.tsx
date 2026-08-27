import { useSelector } from "react-redux";

import { useState } from "react";

import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View
} from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  ILoadingModalContext,
  useLoadingModal
} from "@/app/context/loading/LoadingModalContext";
import { AllStackParamList, EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { IconButton } from "@/design-system/components/IconButton";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { HomeNextEvent } from "@/features/home/components/HomeNextEvent";
import {
  deleteEventFromDatabase,
  getEventsFromDatabase
} from "@/services/firebase/firebaseEventFunctions";
import { deleteEventInvitesFromDatabase } from "@/services/firebase/firebaseInviteFunctions";
import { createNotificationsForEvents } from "@/services/pushNotifications";
import { UserState } from "@/store/UserSlice";
import { formatDate } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { SectionButton } from "../components/edit/SectionButton";
import { useEventEdit } from "../hooks/useEventEdit";

interface EventEditScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEdit">;
}

export function EventEditScreen({ navigation, route }: EventEditScreenProps) {
  const originalEvent = route.params.event;
  const { event } = useEventEdit(originalEvent, navigation);

  const [scrollY, setScrollY] = useState(0);
  const { setLoading } = useLoadingModal() as ILoadingModalContext;
  const userId = useSelector((state: UserState) => state.uid);

  function goToSection(section: string) {
    (navigation as StackNavigationProp<EventsStackParamList>).navigate(
      "EventEditSection",
      {
        event,
        section
      }
    );
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setScrollY(-event.nativeEvent.contentOffset.y);
  }

  async function deleteEvent() {
    try {
      setLoading(true);
      await deleteEventFromDatabase(event.id);
      await deleteEventInvitesFromDatabase(event.id);
      const { upcomingEvents } = await getEventsFromDatabase(userId);
      await createNotificationsForEvents(upcomingEvents);
    } catch (error) {
      log(`Error deleting event: ${(error as any)?.message ?? error}`, "error");
      showErrorToast("Error Deleting Event");
    } finally {
      setLoading(false);
    }
  }

  function deleteEventAlert() {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteEvent();
          navigation.goBack();
          haptics.error();
        }
      }
    ]);
  }

  if (!event) {
    return (
      <View style={styles.notFoundContainer}>
        <Text>Event not found</Text>
      </View>
    );
  }

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: event.name.trim() || "Event",
          subTitle: formatDate(event.date),
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "book",
          backAction: true,
          accountButton: false
        },
        backgroundColor: colors.primary
      }}
      contentConfig={{
        tabBarPresent: true,
        backgroundColor: colors.lightGray
      }}
      handleScroll={handleScroll}
    >
      <View
        style={[
          styles.animatedBackground,
          {
            top: -scrollY - 100,
            height: scrollY + 100
          }
        ]}
      />

      <View style={styles.contentContainer}>
        <View style={styles.trashButtonContainer}>
          <IconButton
            iconName={"trash"}
            onPress={deleteEventAlert}
            size="small"
            color={colors.primary}
            marginBottom={0}
            marginTop={0}
          />
        </View>

        <View style={styles.buttonRow}>
          <SectionButton
            color={colors.primary}
            icon="edit"
            title="Details"
            onPress={goToSection}
          />

          <SectionButton
            color={colors.primaryTint}
            icon="file"
            title="Essentials"
            onPress={goToSection}
          />

          <SectionButton
            color={colors.gray}
            icon="bars"
            title="To Do"
            onPress={goToSection}
          />
        </View>

        <View style={styles.buttonRow}>
          <SectionButton
            color={colors.secondary}
            icon="play-circle"
            title="Music"
            onPress={goToSection}
          />

          <SectionButton
            color={colors.primaryTint2}
            icon="clock"
            title="Timeline"
            onPress={goToSection}
          />

          <SectionButton
            color={colors.darkGray}
            icon="envelope"
            title="Invites"
            onPress={goToSection}
          />
        </View>

        <View style={styles.buttonRow}>
          <SectionButton
            color={colors.primary}
            icon="calendar"
            title="Itinerary"
            onPress={goToSection}
          />
          <View style={styles.flex1} />
          <View style={styles.flex1} />
        </View>
      </View>

      <HomeNextEvent title={false} event={event} edit />
    </Screen>
  );
}

const styles = StyleSheet.create({
  animatedBackground: {
    backgroundColor: colors.white,
    left: 0,
    position: "absolute",
    right: 0
  },
  buttonRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24
  },
  contentContainer: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    paddingTop: 16
  },
  flex1: {
    flex: 1
  },
  notFoundContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  trashButtonContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 24
  }
});
