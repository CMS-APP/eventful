import { StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { Screen } from "@/components/views/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import {
  AllStackParamList,
  ContactsStackParamList
} from "@/features/app/navigationTypes";
import { haptics } from "@/utils/haptics";
import { useScreenStatusBar } from "@/utils/statusBar";

import { ContactsInviteInfo } from "../components/ContactsInviteInfo";
import { ContactsSearch } from "../components/ContactsSearch";

interface ContactsScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function ContactsScreen({ navigation }: ContactsScreenProps) {
  useScreenStatusBar(true);

  function openSearch() {
    haptics.soft();
    (navigation as StackNavigationProp<ContactsStackParamList>).navigate(
      "ContactSearch",
      {
        open: true
      }
    );
  }

  return (
    <Screen
      headerConfig={{
        type: "curvy",
        curvyHeaderProps: {
          title: "Contacts",
          color: colors.white,
          backgroundColor: colors.primary,
          icon: "users"
        }
      }}
    >
      <View style={styles.searchContainer}>
        <ContactsSearch buttonAction={openSearch} />
      </View>
      <ContactsInviteInfo />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 52
  }
});
