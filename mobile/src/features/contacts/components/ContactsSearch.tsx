import React, { useCallback } from "react";

import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { InputAccessory } from "@/components/inputs/InputAccessory";
import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { getHitSlop } from "@/utils/hitSlop";

interface ContactsSearchProps {
  search?: string;
  setSearch?: (search: string) => void;
  buttonAction?: (() => void) | undefined;
  textInputRef?: React.RefObject<TextInput | null>;
  placeholder?: string;
  accessoryId?: string;
  showSeparator?: boolean;
  inset?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function ContactsSearch({
  search = "",
  setSearch = () => {},
  buttonAction = undefined,
  textInputRef = undefined,
  placeholder = "Search For Users...",
  accessoryId = "contactSearchInput",
  showSeparator = true,
  inset = true,
  onFocus,
  onBlur
}: ContactsSearchProps) {
  const renderSearch = useCallback(
    (disabled: boolean) => {
      return (
        <View
          style={[
            styles.searchContainer,
            buttonAction
              ? styles.searchContainerWithButton
              : inset
                ? styles.searchContainerWithoutButton
                : styles.searchContainerFullWidth,
            {
              backgroundColor: colors.lightGray
            }
          ]}
        >
          <FontAwesome5 name="search" size={16} color={colors.black} />
          {disabled ? (
            <Text type="body" style={styles.buttonLabel}>
              {placeholder}
            </Text>
          ) : (
            <>
              <TextInput
                ref={textInputRef}
                aria-disabled={disabled}
                style={styles.textInput}
                value={search}
                onChangeText={(text) => setSearch(text)}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                placeholderTextColor={colors.black}
                autoCapitalize="none"
                inputAccessoryViewID={accessoryId}
              />

              {search !== "" && (
                <TouchableOpacity
                  onPress={() => setSearch("")}
                  hitSlop={getHitSlop("small")}
                >
                  <FontAwesome5
                    name="times-circle"
                    size={16}
                    color={colors.black}
                  />
                </TouchableOpacity>
              )}

              <InputAccessory
                value={search}
                placeholder={placeholder}
                nativeID={accessoryId}
              />
            </>
          )}
        </View>
      );
    },
    [
      buttonAction,
      textInputRef,
      search,
      setSearch,
      placeholder,
      accessoryId,
      onFocus,
      onBlur
    ]
  );

  const normalSearch = useCallback(() => {
    return (
      <View>
        {renderSearch(false)}
        {showSeparator && <View style={styles.separator} />}
      </View>
    );
  }, [renderSearch, showSeparator]);

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
  searchContainer: {
    alignItems: "center",
    minHeight: 44,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16
  },
  searchContainerWithButton: {
    marginHorizontal: 0
  },
  searchContainerWithoutButton: {
    marginHorizontal: 24
  },
  searchContainerFullWidth: {
    marginHorizontal: 0
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
  },
  buttonLabel: {
    color: colors.black,
    flex: 1,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "capitalize"
  }
});
