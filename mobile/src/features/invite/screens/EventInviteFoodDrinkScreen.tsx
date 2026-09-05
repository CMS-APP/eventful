import { useEffect, useState } from "react";

import { StyleSheet, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EventInviteStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Input } from "@/design-system/components/inputs/Input";
import { colors } from "@/design-system/tokens/colors";
import { updateResponseInDatabase } from "@/services/firebase/invite";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

type Props = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteDietary"
>;

export function EventInviteFoodDrinkScreen({ route }: Props) {
  const { event, invite } = route.params;
  const [dietary, setDietary] = useState(invite.dietary ?? "");

  useEffect(() => {
    if (invite.dietary !== dietary) {
      try {
        updateResponseInDatabase(invite, {
          response: invite.response,
          dietary
        });
      } catch (error) {
        log(`Error Updating Requirements: ${error}`, "error");
        showErrorToast("Error Updating Requirements");
      }
    }
  }, [dietary, invite]);

  if (!event || !invite) {
    return null;
  }

  return (
    <Screen
      headerConfig={{
        type: "flat",
        backgroundColor: colors.primary,
        flatHeaderProps: {
          title: "Food & Drink",
          backgroundColor: colors.primary,
          dark: true,
          backAction: true,
          icon: "utensils"
        }
      }}
      contentConfig={{
        backgroundColor: colors.primary
      }}
    >
      <View style={styles.container}>
        <Input
          placeholder="Dietary Preferences"
          onChangeText={setDietary}
          value={dietary}
          dark
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24
  }
});
