import { getAuth } from "@react-native-firebase/auth";
import { useSelector } from "react-redux";

import React, { useCallback, useEffect, useState } from "react";

import { Animated } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { ModalView } from "@/components/views/ModalView";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { EventsStackParamList } from "@/features/app/navigationTypes";
import { createEventInDatabase } from "@/services/firebase/firebaseEventFunctions";
import { UserState } from "@/store/UserSlice";
import { Event, NewEvent } from "@/types/Event";
import { AppError } from "@/utils/error";

interface CreateEventModalProps {
  showModal: boolean;
  setShowModal: (showModal: boolean) => void;
}

export function CreateEventModal({
  showModal,
  setShowModal
}: CreateEventModalProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const [eventName, setEventName] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];
  const navigation =
    useNavigation() as StackNavigationProp<EventsStackParamList>;

  const createEvent = useCallback(async () => {
    try {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      date.setMinutes(date.getMinutes() + 5 - (date.getMinutes() % 5));

      const event: Event = NewEvent(date, userId, eventName);

      setEventName("");
      setShowModal(false);

      const user = getAuth().currentUser;
      await createEventInDatabase(event, user);

      navigation.navigate("EventEdit", { event });
    } catch (error) {
      new AppError(error, "Error creating event", true);
    }
  }, [eventName, userId, navigation, setShowModal]);

  useEffect(() => {
    if (showModal) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [showModal, fadeAnim]);

  return (
    <ModalView
      show={showModal}
      setShow={setShowModal}
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <Text type="header" color="white">
        Create New Event
      </Text>

      <Input
        placeholder="Event Name"
        value={eventName}
        onChangeText={setEventName}
        dark
      />

      <Button
        text="Create Event"
        onPress={createEvent}
        color={colors.primaryTint}
        textColor={colors.white}
        icon="plus"
      />
    </ModalView>
  );
}
