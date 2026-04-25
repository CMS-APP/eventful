import React, { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { Button } from "@/components/buttons/Button";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { Event } from "@/types/Event";
import { Itinerary } from "@/types/Itinerary";
import { addMinutes, parseDatabaseDate } from "@/utils/date";

import { AddActivityModal } from "./components/itinerary/AddActivityModal";
import { ItineraryDateTime } from "./components/itinerary/ItineraryDateTime";
import { ItineraryList } from "./components/itinerary/ItineraryList";
import { ItineraryQuickAdd } from "./components/itinerary/ItineraryQuickAdd";

interface EventItineraryEditProps {
  event: Event;
  setEvent: React.Dispatch<React.SetStateAction<Event>>;
}

export function EventItineraryEdit({
  event,
  setEvent
}: EventItineraryEditProps) {
  const [itinerary, setItinerary] = useState<Itinerary[]>(
    event.itinerary || []
  );
  const [editEventDateTime, setEditEventDateTime] = useState(false);

  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [modalActivity, setModalActivity] = useState<Itinerary | null>(null);
  const [modalPresetTitle, setModalPresetTitle] = useState<string | undefined>(
    undefined
  );
  const [modalPresetStart, setModalPresetStart] = useState<Date | undefined>(
    undefined
  );

  const getDefaultStartTime = () => {
    const eventStart = parseDatabaseDate(event.date);
    const eventEnd = event.endDate ? parseDatabaseDate(event.endDate) : null;

    if (!itinerary.length) return eventStart;

    let lastEnd = eventStart;
    for (const it of itinerary) {
      const start = parseDatabaseDate(it.startTime);
      const end = addMinutes(start, it.durationMinutes || 60);
      if (end > lastEnd) lastEnd = end;
    }

    // clamp within event if possible
    if (eventEnd && lastEnd > eventEnd) return eventEnd;
    return lastEnd;
  };

  const handleAddActivity = () => {
    setModalActivity(null);
    setModalPresetTitle(undefined);
    setModalPresetStart(getDefaultStartTime());
    setShowAddActivityModal(true);
  };

  const handleQuickAdd = (title: string) => {
    setModalActivity(null);
    setModalPresetTitle(title);
    setModalPresetStart(getDefaultStartTime());
    setShowAddActivityModal(true);
  };

  const handleEditActivity = (activity: Itinerary) => {
    setModalActivity(activity);
    setModalPresetTitle(undefined);
    setModalPresetStart(undefined);
    setShowAddActivityModal(true);
  };

  const handleSaveActivity = (activity: Itinerary) => {
    const exists = itinerary.some((it) => it.id === activity.id);
    setItinerary(
      exists
        ? itinerary.map((it) => (it.id === activity.id ? activity : it))
        : [...itinerary, activity]
    );
  };

  const handleDeleteActivity = (activityId: string) => {
    setItinerary(itinerary.filter((it) => it.id !== activityId));
  };

  const handleEditItinerary = () => {
    setEditEventDateTime(!editEventDateTime);
  };

  const handleSaveChanges = () => {
    setEditEventDateTime(false);
  };

  useEffect(() => {
    setEvent((prev) => ({ ...prev, itinerary }));
  }, [itinerary, setEvent]);

  return (
    <View style={styles.container}>
      <ItineraryDateTime
        event={event}
        editEventDateTime={editEventDateTime}
        setEvent={setEvent}
        handleAddActivity={handleAddActivity}
        handleEditDateTime={handleEditItinerary}
        handleSaveChanges={handleSaveChanges}
      />

      {!editEventDateTime && (
        <>
          <ItineraryQuickAdd onQuickAdd={handleQuickAdd} />

          <ItineraryList
            event={event}
            itinerary={itinerary}
            onActivityPress={handleEditActivity}
          />

          <View style={globalStyles.divider} />

          <View style={styles.buttonContainer}>
            <Button
              text="Add Item"
              onPress={handleAddActivity}
              color={colors.primaryTint}
              textColor={colors.white}
              flex={undefined}
              icon="plus"
            />
          </View>
        </>
      )}

      <AddActivityModal
        event={event}
        visible={showAddActivityModal}
        setVisible={setShowAddActivityModal}
        initialActivity={modalActivity}
        presetTitle={modalPresetTitle}
        presetStartTime={modalPresetStart}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    backgroundColor: colors.primary,
    flex: 1,
    gap: 16,
    paddingHorizontal: 24
  }
});
