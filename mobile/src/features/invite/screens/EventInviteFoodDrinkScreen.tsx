import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Input } from "@/components/inputs/Input";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { FlatHeader } from "@/components/views/screen/FlatHeader";
import { EventInviteStackParamList } from "@/features/app/navigationTypes";
import { updateResponseInDatabase } from "@/services/firebase/firebaseInviteFunctions";
import { colors } from "@/styles/colors";
import { AppError } from "@/utils/error";
import { log } from "@/utils/logging";

type Props = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteDietary"
>;

export function EventInviteFoodDrinkScreen({ navigation, route }: Props) {
  const { event, invite } = route.params;
  const [dietary, setDietary] = useState(invite.dietary ?? "");

  useEffect(() => {
    if (invite.dietary !== dietary) {
      try {
        log(`Updating dietary requirements to: ${dietary}`, "info");
        updateResponseInDatabase(invite, {
          response: invite.response,
          dietary
        });
      } catch (error) {
        new AppError(error, "Error updating dietary requirements", true);
      }
    }
  }, [dietary, invite]);

  if (!event || !invite) {
    return null;
  }

  const headerConfig = {
    title: "Food & Drink",
    backgroundColor: colors.primary,
    dark: true,
    backAction: true,
    icon: "utensils"
  };

  return (
    <View style={styles.container}>
      <KeyboardScrollView
        tabBarPresent={false}
        handleScroll={() => {}}
        _handleScroll={() => {}}
        backgroundColor={colors.primary}
      >
        <View style={styles.headerContainer}>
          <FlatHeader {...headerConfig} />
        </View>
        <View style={styles.inputContainer}>
          <Input
            placeholder="Dietary Preferences"
            onChangeText={setDietary}
            value={dietary}
            dark
          />
        </View>
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    flex: 1
  },
  headerContainer: {
    paddingTop: 24
  },
  inputContainer: {
    paddingHorizontal: 24
  }
});
