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

import { EventBudgetCategoryEdit } from "../components/budget/EventBudgetCategoryEdit";
import { useEventEditor } from "../hooks/useEventEditor";

interface EventFoodScreenEditProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEditFood">;
}

export function EventFoodScreenEdit({
  navigation,
  route
}: EventFoodScreenEditProps) {
  const { event, setEvent } = useEventEditor(route.params.event);
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
        <EventBudgetCategoryEdit
          event={event}
          setEvent={setEvent}
          field="foodItems"
          title="Food"
        />

        <Input
          placeholder={premium ? "Food Notes" : "Food"}
          value={event.food}
          onChangeText={(text) =>
            setEvent((prev) => ({ ...prev, food: text ?? "" }))
          }
          dark
          backgroundColor={colors.white}
          textColor={colors.black}
          multilineProps={{
            numberOfLines: 10,
            height: 100
          }}
        />

        <AmazonButton type={"Food"} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 16,
    marginHorizontal: 16
  }
});
