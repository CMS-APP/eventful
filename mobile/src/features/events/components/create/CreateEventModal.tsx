import { getAuth } from "@react-native-firebase/auth";
import { useSelector } from "react-redux";

import React, { useCallback, useEffect, useState } from "react";

import { Animated } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { EventsStackParamList } from "@/app/navigation";
import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { EventDateTimeRangeEditor } from "@/features/events/components/edit/components/EventDateTimeRangeEditor";
import { trackEventCreated } from "@/services/analytics/events";
import { createEventInDatabase } from "@/services/firebase/event";
import { UserState } from "@/store/UserSlice";
import { Event, NewEvent } from "@/types/Event";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

interface CreateEventModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

function getDefaultEventDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setMinutes(date.getMinutes() + 5 - (date.getMinutes() % 5));
  return date;
}

export function CreateEventModal({
  showModal,
  setShowModal
}: CreateEventModalProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const [eventName, setEventName] = useState("");
  const [draftEvent, setDraftEvent] = useState<Event>(() =>
    NewEvent(getDefaultEventDate(), userId, "")
  );
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation =
    useNavigation() as StackNavigationProp<EventsStackParamList>;

  const createEvent = useCallback(async () => {
    try {
      const event: Event = {
        ...draftEvent,
        name: eventName,
        userId
      };

      setEventName("");
      setShowModal(false);

      const user = getAuth().currentUser;
      await createEventInDatabase(event, user);
      trackEventCreated();

      navigation.navigate("EventEdit", { event });
    } catch (error) {
      log(`Error Creating Event: ${error}`, "error");
      showErrorToast("Error Creating Event");
    }
  }, [draftEvent, eventName, userId, navigation, setShowModal]);

  useEffect(() => {
    if (showModal) {
      setDraftEvent(NewEvent(getDefaultEventDate(), userId, ""));
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [showModal, fadeAnim, userId]);

  return (
    <ModalView
      show={showModal}
      setShow={setShowModal}
      backgroundColor={colors.white}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color={colors.black}>
        Create New Event
      </Text>

      <Input
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
        backgroundColor={colors.lightGray}
        textColor={colors.black}
      />

      <EventDateTimeRangeEditor
        event={draftEvent}
        setEvent={setDraftEvent}
        handleSaveChanges={() => {}}
        showSaveChanges={false}
      />

      <Button
        text="Create Event"
        onPress={createEvent}
        color={colors.primary}
        textColor={colors.white}
        leadingIcon="plus"
      />
    </ModalView>
  );
}
