import { useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList, InspirationStackParamList } from "@/app/navigation";
import { FlatHeader } from "@/components/screen/FlatHeader";
import { FlatHeaderProps } from "@/components/screen/props";
import { KeyboardScrollView } from "@/components/views/KeyboardScrollView";
import { Button } from "@/design-system/components/buttons/Button";
import { Input } from "@/design-system/components/inputs/Input";
import { Divider } from "@/design-system/components/layout/Divider";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { padding } from "@/design-system/tokens/padding";
import { createPollInDatabase } from "@/services/firebase/inspiration";
import { showOptionsAlert } from "@/utils/alertModal";

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

    showOptionsAlert("Are you sure?", "This will replace your current poll", [
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
                style={[padding.smallWidget, styles.optionContainer]}
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
                  <View style={[padding.smallWidget, styles.removeButton]}>
                    <Text type="body" style={styles.removeButtonText}>
                      Remove
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            <Divider />

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
              leadingIcon="plus"
            />

            <Divider />

            <Button
              text={"Create New Poll"}
              color={colors.primary}
              textColor={colors.white}
              onPress={createNewPollAlert}
              leadingIcon="poll"
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
