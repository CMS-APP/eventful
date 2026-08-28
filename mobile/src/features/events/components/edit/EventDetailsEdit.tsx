import { useCallback } from "react";

import { StyleSheet, View } from "react-native";

import { Input } from "@/design-system/components/Input";
import { colors } from "@/design-system/tokens/colors";
import { EventDateTimeRangeEditor } from "@/features/events/components/edit/components/EventDateTimeRangeEditor";
import { Event } from "@/types/Event";

interface EventDetailsEditProps {
  event: Event;
  setEvent: (event: Event) => void;
}

export function EventDetailsEdit({ event, setEvent }: EventDetailsEditProps) {
  const setEventName = useCallback(
    (text: string) => {
      setEvent({
        ...event,
        name: text
      });
    },
    [setEvent, event]
  );

  const setEventTheme = useCallback(
    (text: string) => {
      setEvent({
        ...event,
        theme: text
      });
    },
    [setEvent, event]
  );

  return (
    <View style={styles.container}>
      <Input
        placeholder="Event Name"
        value={event.name}
        onChangeText={(text) => setEventName(text)}
        dark
      />

      <Input
        placeholder="Theme"
        value={event.theme}
        onChangeText={(text) => setEventTheme(text)}
        dark
      />

      <EventDateTimeRangeEditor
        event={event}
        setEvent={setEvent}
        dark
        handleSaveChanges={() => {}}
        showSaveChanges={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1,
    gap: 12,
    paddingHorizontal: 24
  }
});
