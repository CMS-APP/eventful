import { useSelector } from "react-redux";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Input } from "@/design-system/components/inputs/Input";
import { colors } from "@/design-system/tokens/colors";
import { AmazonButton } from "@/features/events/components/misc/AmazonButton";
import { UserState } from "@/store/UserSlice";

import { EventBudgetItemsEdit } from "../components/budget/EventBudgetItemsEdit";
import { useEventEditor } from "../hooks/useEventEditor";

interface EventDrinkScreenEditProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEditDrink">;
}

export function EventDrinkScreenEdit({ route }: EventDrinkScreenEditProps) {
  const premium = useSelector((state: UserState) => state.premium);
  const { event, setEvent } = useEventEditor(route.params.event);

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
        <EventBudgetItemsEdit
          event={event}
          setEvent={setEvent}
          field="drinkItems"
          title="Drink"
        />
        <Input
          placeholder={premium ? "Drink Notes" : "Drink"}
          value={event.drink}
          onChangeText={(text) =>
            setEvent((prev) => ({ ...prev, drink: text ?? "" }))
          }
          dark
          backgroundColor={colors.white}
          textColor={colors.black}
          multilineProps={{
            numberOfLines: 10,
            height: 100
          }}
        />

        <AmazonButton type={"Drink"} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 16,
    paddingHorizontal: 16
  }
});
