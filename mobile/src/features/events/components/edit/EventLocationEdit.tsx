import { StyleSheet, View } from "react-native";

import { LocationSearch } from "@/features/events/components/edit/components/location/LocationSearch";
import { Event } from "@/types/Event";

interface EventLocationEditProps {
  event: Event;
  setEvent: (event: Event) => void;
}

export function EventLocationEdit({ event, setEvent }: EventLocationEditProps) {
  return (
    <View style={styles.container}>
      <LocationSearch event={event} setEvent={setEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24
  }
});
