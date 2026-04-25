import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { Input } from "@/components/inputs/Input";
import { Screen } from "@/components/views/screen/Screen";
import { EventsStackParamList } from "@/features/app/navigationTypes";
import { colors } from "@/styles/colors";

import { useEventFieldUpdate } from "../hooks/useEventFieldUpdate";

interface EventNotesScreenEditProps {
  route: RouteProp<EventsStackParamList, "EventEditNotes">;
}

export function EventNotesScreenEdit({ route }: EventNotesScreenEditProps) {
  const { event, setEventField: setEventNotes } = useEventFieldUpdate(
    route.params.event,
    "notes"
  );

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Notes",
          backgroundColor: colors.primaryTint,
          dark: true,
          backAction: true,
          icon: "sticky-note"
        },
        backgroundColor: colors.primaryTint
      }}
      contentConfig={{
        tabBarPresent: true,
        backgroundColor: colors.primaryTint
      }}
    >
      <View style={styles.container}>
        <Input
          placeholder="Notes"
          value={event.notes ?? ""}
          onChangeText={setEventNotes}
          dark
          backgroundColor={colors.lightGray}
          textColor={colors.black}
          multilineProps={{ numberOfLines: 10, height: 300 }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24
  }
});
