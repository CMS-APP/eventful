import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { FlatHeader } from "@/components/screen/FlatHeader";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { Input } from "@/design-system/components/Input";
import { colors } from "@/design-system/tokens/colors";
import { updateResponseInDatabase } from "@/services/firebase/firebaseInviteFunctions";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

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
        log(
          `Error updating dietary requirements: ${(error as any)?.message ?? error}`,
          "error"
        );
        showErrorToast("Error Updating Requirements");
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
