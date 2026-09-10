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

interface EventDecorScreenEditProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEditDecor">;
}

export function EventDecorScreenEdit({
  navigation,
  route
}: EventDecorScreenEditProps) {
  const { event, setEvent } = useEventEditor(route.params.event);
  const premium = useSelector((state: UserState) => state.premium);

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Decor",
          backgroundColor: colors.primaryTint,
          dark: true,
          backAction: true,
          icon: "gift"
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
          field="decorItems"
          title="Decor"
        />

        <Input
          placeholder={premium ? "Decor Notes" : "Decor"}
          value={event.decor}
          onChangeText={(text) =>
            setEvent((prev) => ({ ...prev, decor: text ?? "" }))
          }
          dark
          backgroundColor={colors.white}
          textColor={colors.black}
          multilineProps={{
            numberOfLines: 10,
            height: 100
          }}
        />

        <AmazonButton type={"Decor"} />
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
