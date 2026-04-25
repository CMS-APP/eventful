import { useCallback } from "react";

import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/components/text/Text";
import { AllStackParamList } from "@/features/app/navigationTypes";
import { colors } from "@/styles/colors";
import { haptics } from "@/utils/haptics";
import { getHitSlop } from "@/utils/hitSlop";

import { FlatHeaderProps } from "./props";

export function FlatHeader({ backgroundColor, ...props }: FlatHeaderProps) {
  const color = props.dark ? colors.white : colors.black;
  const nav = useNavigation<StackNavigationProp<AllStackParamList>>();

  function leftAction() {
    if (props?.backAction && typeof props?.backAction === "function") {
      props?.backAction();
    } else if (props?.backAction && typeof props?.backAction === "boolean") {
      nav.goBack();
    } else {
      null;
    }
  }

  const rightAction = useCallback(() => {
    haptics.soft();
    props.iconRightAction?.();
  }, [props.iconRightAction]);

  const Side = useCallback(
    ({ isLeft }: { isLeft: boolean }) => {
      if (isLeft && props.backAction) {
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

      if (!isLeft && props.iconRight) {
        return (
          <TouchableOpacity
            onPress={rightAction}
            hitSlop={getHitSlop("small")}
            style={styles.iconButton}
          >
            <FontAwesome5 name={props.iconRight} size={26} color={color} />
          </TouchableOpacity>
        );
      }

      return <View style={styles.spacer} />;
    },
    [leftAction, rightAction, props.iconRight, color]
  );

  const paddingTop = Platform.OS === "android" ? 12 : 0;

  let containerStyle = { ...styles.container, paddingTop: paddingTop };

  return (
    <View style={[containerStyle, { backgroundColor }]}>
      <Side isLeft={true} />
      <View style={styles.titleContainer}>
        {props.icon && (
          <FontAwesome5
            name={props.icon}
            size={26}
            color={color}
            style={styles.headerIcon}
          />
        )}
        <Text type="header" color={color}>
          {props.title}
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
