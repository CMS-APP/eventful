import React from "react";

import { StyleSheet, View } from "react-native";

import { useNavigation } from "@react-navigation/native";

import { FontAwesome5 } from "@expo/vector-icons";

import { IconButtonV2 } from "@/design-system/components/buttons/IconButtonV2";
import { Text } from "@/design-system/components/text/Text";

import { ArcCutout } from "../views/ArcCutout";
import { CurvyHeaderProps } from "./props";

type CurvyHeaderV2Props = {
  curvyHeaderProps?: CurvyHeaderProps;
  children?: React.ReactNode;
};

export function CurvyHeaderV2({
  curvyHeaderProps,
  children
}: CurvyHeaderV2Props) {
  const navigation = useNavigation();

  function handleBackPress() {
    navigation.goBack();
  }

  if (!curvyHeaderProps) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <IconButtonV2
          icon="arrow-left"
          color="white"
          onPress={handleBackPress}
          size="large"
        />

        <View style={styles.titleContainer}>
          <FontAwesome5 name={curvyHeaderProps.icon} color="white" size={24} />
          <Text type="header" color="white">
            {curvyHeaderProps.title}
          </Text>
        </View>

        <View style={styles.spacer} />
      </View>
      {children}

      <ArcCutout
        color={curvyHeaderProps?.arcCutoutColor}
        position={{ top: 62, right: 0 }}
      />
      <ArcCutout
        color={curvyHeaderProps?.backgroundColor}
        position={{ top: 102, left: 0 }}
        rotation={-90}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginTop: 12
  },
  spacer: {
    width: 24
  },
  titleContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  }
});
