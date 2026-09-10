import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { EventsStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { Event } from "@/types/Event";
import { haptics } from "@/utils/haptics";

interface BudgetNotesRowProps {
  event: Event;
}

export function BudgetNotesRow({ event }: BudgetNotesRowProps) {
  const navigation =
    useNavigation() as StackNavigationProp<EventsStackParamList>;

  const handlePress = () => {
    haptics.soft();
    navigation.navigate("EventEditNotes", { event });
  };

  return (
    <TouchableOpacity onPress={handlePress} hitSlop={getHitSlop("small")}>
      <View style={styles.container}>
        <Image
          source={require("@/assets/icons/notes.png")}
          style={styles.image}
          tintColor={colors.black}
        />

        <View style={styles.textContainer}>
          <Text type="body" color={colors.black}>
            Notes
          </Text>
        </View>

        <FontAwesome5 name="chevron-right" size={16} color={colors.gray} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.small,
    ...padding.mediumWidget,
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  image: {
    height: 24,
    tintColor: colors.black,
    width: 24
  },
  textContainer: {
    flex: 1,
    gap: 2
  }
});
