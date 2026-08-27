import { useSelector } from "react-redux";

import { StyleSheet, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, EventsStackParamList } from "@/app/navigationTypes";
import { Screen } from "@/components/screen/Screen";
import { Divider } from "@/design-system/components/Divider";
import { Input } from "@/design-system/components/Input";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { AmazonButton } from "@/features/events/components/misc/AmazonButton";
import { UserState } from "@/store/UserSlice";

import { EventDecorEdit } from "../components/essentials/EventDecorEdit";
import { useEventFieldUpdate } from "../hooks/useEventFieldUpdate";

interface EventDecorScreenEditProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventEditDecor">;
}

export function EventDecorScreenEdit({
  navigation,
  route
}: EventDecorScreenEditProps) {
  const { event, setEventField: setEventDecor } = useEventFieldUpdate(
    route.params.event,
    "decor"
  );
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
        <EventDecorEdit route={route} />

        <Input
          placeholder={premium ? "Decor Notes" : "Decor"}
          value={event.decor}
          onChangeText={(text) => setEventDecor(text)}
          dark
          backgroundColor={colors.lightGray}
          textColor={colors.black}
          multilineProps={{
            numberOfLines: 10,
            height: 100
          }}
        />

        <Divider dark />

        <Text type="subHeader" color={colors.white} center>
          Want some inspiration?
        </Text>

        <AmazonButton type={"Decor"} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 16,
    paddingHorizontal: 24
  }
});
