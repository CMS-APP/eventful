import { StyleSheet, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { FontAwesome5 } from "@expo/vector-icons";

import { getHitSlop } from "@/utils/hitSlop";

import { Text } from "../../../design-system/components/Text";
import { ArcCutout2 } from "../ArcCutout2";
import { CurvyHeaderProps } from "./props";

export function CurvyHeader({ ...props }: CurvyHeaderProps) {
  const nav = useNavigation();

  function handleBackAction() {
    if (props?.backAction && typeof props?.backAction === "function") {
      props?.backAction();
    } else if (props?.backAction && typeof props?.backAction === "boolean") {
      nav.goBack();
    } else {
      null;
    }
  }

  return (
    <View style={styles.container}>
      {props?.backAction && (
        <TouchableOpacity
          onPress={handleBackAction}
          hitSlop={getHitSlop("small")}
        >
          <FontAwesome5 name="arrow-left" size={24} color={props?.color} />
        </TouchableOpacity>
      )}

      <View style={styles.titleContainer}>
        <Text type="header" color={props?.color} numberOfLines={1}>
          {props?.title}
        </Text>
        {props?.subTitle && (
          <Text type="subHeader" color={props?.color} numberOfLines={1}>
            {props?.subTitle}
          </Text>
        )}
      </View>

      <ArcCutout2
        color={props?.arcCutoutColor}
        position={{ top: 53, right: 0 }}
      />
      <ArcCutout2
        color={props?.backgroundColor}
        position={{ top: 92, left: 0 }}
        rotation={-90}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    height: 92,
    paddingBottom: 44,
    paddingHorizontal: 24,
    paddingTop: 20,
    width: "100%"
  },
  titleContainer: {
    alignItems: "flex-start",
    flex: 1
  }
});
