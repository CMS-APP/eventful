import { useSelector } from "react-redux";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";

import { EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Input } from "@/design-system/components/inputs/Input";
import { colors } from "@/design-system/tokens/colors";
import { UserState } from "@/store/UserSlice";

import { EventOutfitEdit } from "../components/essentials/EventOutfitEdit";
import { useEventFieldUpdate } from "../hooks/useEventFieldUpdate";

interface EventOutfitScreenEditProps {
  route: RouteProp<EventsStackParamList, "EventEditOutfit">;
}

export function EventOutfitScreenEdit({ route }: EventOutfitScreenEditProps) {
  const premium = useSelector((state: UserState) => state.premium);
  const { event, setEventField: setEventOutfit } = useEventFieldUpdate(
    route.params.event,
    "outfit"
  );

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Outfit",
          backgroundColor: colors.primaryTint,
          dark: true,
          backAction: true,
          icon: "tshirt"
        },
        backgroundColor: colors.primaryTint
      }}
      contentConfig={{
        tabBarPresent: true,
        backgroundColor: colors.primaryTint
      }}
    >
      <View style={styles.content}>
        <EventOutfitEdit route={route} />

        <Input
          placeholder={premium ? "Outfit Notes" : "Outfit"}
          value={event.outfit}
          onChangeText={(text) => setEventOutfit(text)}
          dark
          backgroundColor={colors.lightGray}
          textColor={colors.black}
          multilineProps={{
            numberOfLines: 10,
            height: 100
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingHorizontal: 24
  }
});
