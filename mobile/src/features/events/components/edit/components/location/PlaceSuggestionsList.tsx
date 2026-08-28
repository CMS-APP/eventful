import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { TextButton } from "@/design-system/components/buttons/TextButton";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { PlaceSuggestion } from "@/services/firebase/backend";

interface PlaceSuggestionsListProps {
  suggestions: PlaceSuggestion[];
  onSelect: (suggestion: PlaceSuggestion) => void;
  onClose: () => void;
}

export function PlaceSuggestionsList({
  suggestions,
  onSelect,
  onClose
}: PlaceSuggestionsListProps) {
  return (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsList}>
        <ScrollView>
          {suggestions.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome5 name="search" size={24} color={colors.black} />
              <Text type="subHeader" color={colors.black} center>
                No results found
              </Text>
              <Text type="body" color={colors.gray} center>
                Please try again with a different search.
              </Text>
            </View>
          ) : (
            <View style={styles.resultsListContainer}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.placeId}
                  style={styles.resultItem}
                  onPress={() => onSelect(suggestion)}
                  hitSlop={getHitSlop("small")}
                >
                  <Text type="body" color={colors.black}>
                    {suggestion.mainText ?? suggestion.text}
                  </Text>
                  {suggestion.secondaryText && (
                    <Text type="body" color={colors.gray}>
                      {suggestion.secondaryText}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <TextButton
        text="Close Results"
        textColor={colors.white}
        textAlign="center"
        type="body"
        onPress={() => onClose()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 24
  },
  resultItem: {
    alignItems: "center",
    backgroundColor: colors.lightGray + "40",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12
  },
  resultsContainer: {
    gap: 8
  },
  resultsList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 4,
    height: 200,
    paddingVertical: 4
  },
  resultsListContainer: {
    gap: 4,
    marginHorizontal: 4
  }
});
