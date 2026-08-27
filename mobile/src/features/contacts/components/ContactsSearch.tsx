import React, { useCallback } from "react";

import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { InputAccessory } from "@/design-system/components/InputAccessory";
import { Text } from "@/design-system/components/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

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
  dark?: boolean;
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
  onBlur,
  dark = false
}: ContactsSearchProps) {
  const textColor = dark ? colors.white : colors.black;

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
              backgroundColor: dark ? colors.primaryTint3 : colors.lightGray
            }
          ]}
        >
          <FontAwesome5 name="search" size={16} color={textColor} />
          {disabled ? (
            <Text type="body" style={styles.buttonLabel} color={textColor}>
              {placeholder}
            </Text>
          ) : (
            <>
              <TextInput
                ref={textInputRef}
                aria-disabled={disabled}
                style={[styles.textInput, { color: textColor }]}
                value={search}
                onChangeText={(text) => setSearch(text)}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                placeholderTextColor={dark ? colors.gray : colors.lightGray}
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
                    color={dark ? colors.white : colors.black}
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
      onBlur,
      textColor,
      dark,
      inset
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
  buttonLabel: {
    color: colors.black,
    flex: 1,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "capitalize"
  },
  searchContainer: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: 16
  },
  searchContainerFullWidth: {
    marginHorizontal: 0
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
