import { useSelector } from "react-redux";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AmazonButton } from "@/components/buttons/AmazonButton";
import { Input } from "@/components/inputs/Input";
import { Text } from "@/components/text/Text";
import { Screen } from "@/components/views/screen/Screen";
import {
  AllStackParamList,
  EventsStackParamList
} from "@/features/app/navigationTypes";
import { UserState } from "@/store/UserSlice";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";

import { EventDrinkEdit } from "../components/essentials/EventDrinkEdit";
import { useEventFieldUpdate } from "../hooks/useEventFieldUpdate";

interface EventDrinkScreenEditProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEditDrink">;
}

export function EventDrinkScreenEdit({ route }: EventDrinkScreenEditProps) {
  const premium = useSelector((state: UserState) => state.premium);
  const { event, setEventField: setEventDrink } = useEventFieldUpdate(
    route.params.event,
    "drink"
  );

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Drink",
          backgroundColor: colors.primaryTint,
          dark: true,
          backAction: true,
          icon: "wine-glass"
        },
        backgroundColor: colors.primaryTint
      }}
      contentConfig={{
        tabBarPresent: true,
        backgroundColor: colors.primaryTint
      }}
    >
      <View style={styles.contentContainer}>
        <EventDrinkEdit route={route} />

        <Input
          placeholder={premium ? "Drink Notes" : "Drink"}
          value={event.drink}
          onChangeText={(text) => setEventDrink(text)}
          dark
          backgroundColor={colors.lightGray}
          textColor={colors.black}
          multilineProps={{
            numberOfLines: 10,
            height: 100
          }}
        />

        <View style={[globalStyles.divider, styles.divider]} />

        <Text type="subHeader" color={colors.white} center>
          Want some inspiration?
        </Text>

        <AmazonButton type={"Drink"} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 16,
    paddingHorizontal: 24
  },
  divider: {
    backgroundColor: colors.lightGray
  }
});
