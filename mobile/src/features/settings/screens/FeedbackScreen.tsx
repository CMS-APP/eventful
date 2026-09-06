import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { FlatHeader } from "@/components/screen/FlatHeader";
import { Button } from "@/design-system/components/buttons/Button";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { Input } from "@/design-system/components/inputs/Input";
import { colors } from "@/design-system/tokens/colors";
import { trackFeedbackSubmitted } from "@/services/analytics/events";
import { sendFeedbackToDatabase } from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { User } from "@/types/User";

const FEEDBACK_TYPES = ["New Feature", "Bug Report"];

export function FeedbackScreen() {
  const navigation = useNavigation();

  const email = useSelector((state: UserState) => state.email);
  const userId = useSelector((state: UserState) => state.uid);
  const name = useSelector((state: UserState) => state.name);
  const username = useSelector((state: UserState) => state.username);

  const [type, setType] = useState(FEEDBACK_TYPES[0]);
  const [description, setDescription] = useState("");

  const handleSubmit = useCallback(() => {
    if (description.trim() === "") {
      Alert.alert("No Input Text", "Please enter some feedback");
      return;
    }

    sendFeedbackToDatabase(
      { uid: userId, email, name, username } as User,
      type,
      description
    );
    trackFeedbackSubmitted(type);
    Alert.alert("Feedback Sent", "Thank you for your feedback!");
    navigation.goBack();
  }, [description, userId, email, name, username, type, navigation]);

  return (
    <View style={styles.container}>
      <FlatHeader title="Feedback" backAction={true} />

      <View style={styles.content}>
        <SegmentedControl
          selections={FEEDBACK_TYPES}
          selectedButton={type}
          setSelectedButton={setType}
          pressColor={colors.primary}
          nonPressColor={colors.gray}
        />

        <View style={styles.field}>
          <Input
            placeholder={
              type === "Bug Report"
                ? "What went wrong?"
                : "What would you like to see?"
            }
            value={description}
            onChangeText={setDescription}
            multilineProps={{ numberOfLines: 10, height: 200 }}
            backgroundColor={colors.lightGray}
            textColor={colors.black}
          />

          <Button
            text="Send Feedback"
            color={colors.primary}
            textColor={colors.white}
            onPress={handleSubmit}
            leadingIcon="paper-plane"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingTop: 24
  },
  content: {
    gap: 20
  },
  field: {
    gap: 8,
    paddingHorizontal: 24
  }
});
