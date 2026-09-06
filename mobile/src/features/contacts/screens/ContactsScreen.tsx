import { StyleSheet, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, ContactsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { colors } from "@/design-system/tokens/colors";
import { haptics } from "@/utils/haptics";

import { ContactsInviteInfo } from "../components/ContactsInviteInfo";
import { ContactsSearch } from "../components/ContactsSearch";
import { SuggestedFollows } from "../components/SuggestedFollows";

interface ContactsScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function ContactsScreen({ navigation }: ContactsScreenProps) {
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
        <ContactsSearch buttonAction={openSearch} showSeparator={true} />
      </View>
      <SuggestedFollows />
      <ContactsInviteInfo />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 0,
    paddingTop: 52
  }
});
