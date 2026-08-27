import React, { useCallback } from "react";

import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { InputAccessory } from "@/design-system/components/InputAccessory";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/utils/hitSlop";

interface ContactsSearchProps {
  search?: string;
  setSearch?: (search: string) => void;
  buttonAction?: (() => void) | undefined;
  textInputRef?: React.RefObject<TextInput | null>;
}

export function ContactsSearch({
  search = "",
  setSearch = () => {},
  buttonAction = undefined,
  textInputRef = undefined
}: ContactsSearchProps) {
  const renderSearch = useCallback(
    (disabled: boolean) => {
      return (
        <View
          style={[
            styles.searchContainer,
            buttonAction
              ? styles.searchContainerWithButton
              : styles.searchContainerWithoutButton,
            {
              backgroundColor: colors.lightGray
            }
          ]}
        >
          <FontAwesome5 name="search" size={16} color={colors.black} />
          {disabled ? (
            <Text type="body" style={styles.buttonLabel}>
              Search For Users...
            </Text>
          ) : (
            <>
              <TextInput
                ref={textInputRef}
                aria-disabled={disabled}
                style={styles.textInput}
                value={search}
                onChangeText={(text) => setSearch(text)}
                placeholder="Search For Users..."
                placeholderTextColor={colors.black}
                autoCapitalize="none"
                inputAccessoryViewID="contactSearchInput"
              />

              <InputAccessory
                value={search}
                placeholder="Search For Users..."
                nativeID="contactSearchInput"
              />
            </>
          )}
        </View>
      );
    },
    [buttonAction, textInputRef, search, setSearch]
  );

  const normalSearch = useCallback(() => {
    return (
      <View>
        {renderSearch(false)}
        <View style={styles.separator} />
      </View>
    );
  }, [renderSearch]);

  const buttonSearch = useCallback(() => {
    return (
      <TouchableOpacity onPress={buttonAction} hitSlop={getHitSlop("small")}>
        {renderSearch(true)}
      </TouchableOpacity>
    );
  }, [buttonAction, renderSearch]);

  return <View>{buttonAction ? buttonSearch() : normalSearch()}</View>;
}

const styles = StyleSheet.create({
  buttonLabel: {
    color: colors.black,
    flex: 1,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "capitalize"
  },
  searchContainer: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    minHeight: 44,
    paddingHorizontal: 16
  },
  searchContainerWithButton: {
    marginHorizontal: 0
  },
  searchContainerWithoutButton: {
    marginHorizontal: 24
  },
  separator: {
    backgroundColor: colors.lightGray,
    height: 1,
    marginTop: 12
  },
  textInput: {
    color: colors.black,
    flex: 1,
    fontSize: 12,
    letterSpacing: 2,
    minHeight: 44,
    paddingVertical: 0,
    textAlignVertical: "center",
    textTransform: "capitalize"
  }
});
