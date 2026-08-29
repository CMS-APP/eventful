import { useEffect, useMemo, useState } from "react";

import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { Event } from "@/types/Event";
import { Itinerary } from "@/types/Itinerary";
import { parseDatabaseDate } from "@/utils/date";
import { generateUUID } from "@/utils/uuid";

import { AddActivityDate } from "./AddActivityDate";

interface AddActivityModalProps {
  event: Event;
  visible: boolean;
  setVisible: (show: boolean) => void;
  initialActivity: Itinerary | null;
  presetTitle?: string;
  presetStartTime?: Date;
  onSave: (activity: Itinerary) => void;
  onDelete: (activityId: string) => void;
}

export function AddActivityModal({
  event,
  visible,
  setVisible,
  initialActivity,
  presetTitle,
  presetStartTime,
  onSave,
  onDelete
}: AddActivityModalProps) {
  const isEditing = !!initialActivity;

  const initialStart = useMemo(() => {
    if (initialActivity?.startTime)
      return parseDatabaseDate(initialActivity.startTime);
    if (presetStartTime) return presetStartTime;
    return parseDatabaseDate(event.date);
  }, [event.date, initialActivity?.startTime, presetStartTime]);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [startTime, setStartTime] = useState<Date>(initialStart);
  const [durationMinutesText, setDurationMinutesText] = useState<string>(
    String(initialActivity?.durationMinutes || 60)
  );

  useEffect(() => {
    if (!visible) return;
    setName(initialActivity?.name ?? presetTitle ?? "");
    setLocation(initialActivity?.location ?? "");
    setNotes(initialActivity?.notes ?? "");
    setStartTime(initialStart);
    setDurationMinutesText(String(initialActivity?.durationMinutes || 60));
  }, [visible, initialActivity, presetTitle, initialStart]);

  const handleSave = () => {
    const startTimeString = startTime.toISOString();
    const durationMinutes = Number(durationMinutesText) || 0;

    const activity: Itinerary = {
      id: initialActivity?.id ?? generateUUID(),
      name,
      startTime: startTimeString,
      durationMinutes,
      location,
      notes
    };

    onSave(activity);
    setVisible(false);
  };

  const handleDelete = () => {
    if (!initialActivity) return;
    onDelete(initialActivity.id);
    setVisible(false);
  };

  return (
    <ModalView
      show={visible}
      setShow={setVisible}
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <View style={styles.headerContainer}>
        <View style={styles.flex} />

        <Text type="header" color="white">
          {isEditing ? "Edit Activity" : "Add Activity"}
        </Text>

        <View style={styles.flex}>
          {isEditing && (
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={getHitSlop("medium")}
            >
              <FontAwesome5 name="trash" size={24} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          placeholder="Activity Name"
          value={name}
          onChangeText={setName}
          dark
        />

        <Input
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          dark
        />

        <AddActivityDate
          event={event}
          activityStartTime={startTime}
          setActivityStartTime={setStartTime}
          durationMinutesText={durationMinutesText}
          setDurationMinutesText={setDurationMinutesText}
        />

        <Input
          placeholder="Notes"
          value={notes}
          onChangeText={setNotes}
          dark
          multilineProps={{ numberOfLines: 10, height: 100 }}
        />

        <Button
          text={isEditing ? "Save Changes" : "Add Activity"}
          onPress={handleSave}
          color={colors.primaryTint}
          textColor={colors.white}
          leadingIcon={isEditing ? "check" : "plus"}
        />
      </ScrollView>
    </ModalView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12
  },
  flex: {
    alignItems: "flex-end",
    flex: 1
  },
  headerContainer: {
    alignItems: "center",
    flexDirection: "row"
  }
});
