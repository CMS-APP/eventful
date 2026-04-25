import { useState } from "react";

import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { Button } from "@/components/buttons/Button";
import { Input } from "@/components/inputs/Input";
import { Text } from "@/components/text/Text";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { FlatHeader } from "@/components/views/screen/FlatHeader";
import { FlatHeaderProps } from "@/components/views/screen/props";
import {
  AllStackParamList,
  InspirationStackParamList
} from "@/features/app/navigationTypes";
import { createPollInDatabase } from "@/services/firebase/firebaseInspirationFunctions";
import { colors } from "@/styles/colors";
import { globalStyles } from "@/styles/globalStyles";
import { getHitSlop } from "@/utils/hitSlop";

interface CreatePollScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
}

export function CreatePollScreen({ navigation }: CreatePollScreenProps) {
  const [pollTitle, setPollTitle] = useState("");
  const [pollSubtitle, setPollSubtitle] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>([]);
  const [pollOption, setPollOption] = useState("");

  function addPollOption() {
    if (!pollOption) return;
    setPollOptions((prev: string[]) => [...prev, pollOption]);
    setPollOption("");
  }

  function createNewPollAlert() {
    if (!pollTitle || !pollSubtitle || pollOptions.length < 2) {
      return;
    }

    Alert.alert("Are you sure?", "This will replace your current poll", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Create Poll",
        onPress: () => {
          createPollInDatabase(pollTitle, pollSubtitle, pollOptions);
          (
            navigation as StackNavigationProp<InspirationStackParamList>
          ).navigate("InspirationHome", { refresh: true });
        }
      }
    ]);
  }

  const headerConfig: FlatHeaderProps = {
    title: "Create Poll",
    backgroundColor: colors.white,
    backAction: true
  };

  return (
    <View style={styles.container}>
      <KeyboardScrollView
        tabBarPresent={false}
        handleScroll={() => {}}
        _handleScroll={() => {}}
        backgroundColor={colors.white}
      >
        <View style={styles.headerContainer}>
          <FlatHeader {...headerConfig} />
          <View style={styles.contentContainer}>
            <Input
              placeholder="Poll Title"
              value={pollTitle}
              onChangeText={setPollTitle}
              backgroundColor={colors.lightGray}
              textColor={colors.black}
            />

            <Input
              placeholder="Poll Subtitle"
              value={pollSubtitle}
              onChangeText={setPollSubtitle}
              backgroundColor={colors.lightGray}
              textColor={colors.black}
            />

            <Text type="subHeader">Poll Options</Text>

            {pollOptions.map((option, index) => (
              <View
                key={`option-${index}-${option}`}
                style={[globalStyles.smallWidget, styles.optionContainer]}
              >
                <View style={styles.optionContent}>
                  <Text type="body" style={styles.optionLabel}>
                    Option {index + 1}
                  </Text>
                  <Text type="body">{option}</Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setPollOptions((prev: string[]) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                  hitSlop={getHitSlop("medium")}
                >
                  <View style={[globalStyles.smallWidget, styles.removeButton]}>
                    <Text type="body" style={styles.removeButtonText}>
                      Remove
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            <View style={globalStyles.divider} />

            <Input
              placeholder="New Poll Option"
              value={pollOption}
              onChangeText={setPollOption}
              backgroundColor={colors.lightGray}
              textColor={colors.black}
            />

            <Button
              text={"Add Poll Option"}
              color={colors.primary}
              textColor={colors.white}
              onPress={addPollOption}
            />

            <View style={globalStyles.divider} />

            <Button
              text={"Create New Poll"}
              color={colors.primary}
              textColor={colors.white}
              onPress={createNewPollAlert}
            />
          </View>
        </View>
      </KeyboardScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12
  },
  contentContainer: {
    gap: 12,
    paddingHorizontal: 24
  },
  headerContainer: {
    gap: 12,
    paddingTop: 24
  },
  optionContainer: {
    backgroundColor: colors.lightGray,
    flexDirection: "row"
  },
  optionContent: {
    flex: 1
  },
  optionLabel: {
    color: colors.gray
  },
  removeButton: {
    backgroundColor: colors.primary
  },
  removeButtonText: {
    color: colors.white
  }
});
