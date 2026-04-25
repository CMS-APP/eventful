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

import { EventFoodEdit } from "../components/essentials/EventFoodEdit";
import { useEventFieldUpdate } from "../hooks/useEventFieldUpdate";

interface EventFoodScreenEditProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEditFood">;
}

export function EventFoodScreenEdit({
  navigation,
  route
}: EventFoodScreenEditProps) {
  const { event, setEventField: setEventFood } = useEventFieldUpdate(
    route.params.event,
    "food"
  );
  const premium = useSelector((state: UserState) => state.premium);

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Food",
          backgroundColor: colors.primaryTint,
          dark: true,
          backAction: true,
          icon: "utensils"
        },
        backgroundColor: colors.primaryTint
      }}
      contentConfig={{
        tabBarPresent: true,
        backgroundColor: colors.primaryTint
      }}
    >
      <View style={styles.contentContainer}>
        <EventFoodEdit route={route} />

        <Input
          placeholder={premium ? "Food Notes" : "Food"}
          value={event.food}
          onChangeText={(text) => setEventFood(text)}
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

        <AmazonButton type={"Food"} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 16,
    marginHorizontal: 24
  },
  divider: {
    backgroundColor: colors.lightGray
  }
});
