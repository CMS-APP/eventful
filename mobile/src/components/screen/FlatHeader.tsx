import { useCallback } from "react";

import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { AllStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { haptics } from "@/utils/haptics";

import { FlatHeaderProps } from "./props";

export function FlatHeader({
  backgroundColor,
  title,
  iconRight,
  iconRightAction,
  backAction,
  dark,
  icon
}: FlatHeaderProps) {
  const color = dark ? colors.white : colors.black;
  const nav = useNavigation<StackNavigationProp<AllStackParamList>>();

  const leftAction = useCallback(() => {
    if (backAction && typeof backAction === "function") {
      backAction();
    } else if (backAction && typeof backAction === "boolean") {
      nav.goBack();
    }
  }, [backAction, nav]);

  const rightAction = useCallback(() => {
    haptics.soft();
    iconRightAction?.();
  }, [iconRightAction]);

  const Side = useCallback(
    ({ isLeft }: { isLeft: boolean }) => {
      if (isLeft && backAction) {
        return (
          <TouchableOpacity
            onPress={leftAction}
            hitSlop={getHitSlop("small")}
            style={styles.iconButton}
          >
            <FontAwesome5 name="arrow-left" size={26} color={color} />
          </TouchableOpacity>
        );
      }

      if (!isLeft && iconRight) {
        return (
          <TouchableOpacity
            onPress={rightAction}
            hitSlop={getHitSlop("small")}
            style={styles.iconButton}
          >
            <FontAwesome5 name={iconRight} size={26} color={color} />
          </TouchableOpacity>
        );
      }

      return <View style={styles.spacer} />;
    },
    [leftAction, rightAction, iconRight, backAction, color]
  );

  const paddingTop = Platform.OS === "android" ? 12 : 0;

  let containerStyle = { ...styles.container, paddingTop: paddingTop };

  return (
    <View style={[containerStyle, { backgroundColor }]}>
      <Side isLeft={true} />
      <View style={styles.titleContainer}>
        {icon && (
          <FontAwesome5
            name={icon}
            size={26}
            color={color}
            style={styles.headerIcon}
          />
        )}
        <Text type="header" color={color}>
          {title}
        </Text>
      </View>
      <Side isLeft={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: 12,
    paddingHorizontal: 24
  },
  headerIcon: {
    margin: 12
  },
  iconButton: {
    flex: 1,
    marginVertical: 12
  },
  spacer: {
    flex: 1
  },
  titleContainer: {
    alignItems: "center",
    flex: 6,
    flexDirection: "row",
    justifyContent: "center"
  }
});
