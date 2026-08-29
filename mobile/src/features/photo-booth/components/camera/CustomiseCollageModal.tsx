import { StyleSheet, View } from "react-native";

import { Button } from "@/design-system/components/buttons/Button";
import { ModalView } from "@/design-system/components/overlays/ModalView";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";

import { CustomiseCollage } from "../customise/CustomiseCollage";

export function CustomiseCollageModal({
  show,
  setShow
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  return (
    <ModalView
      show={show}
      setShow={setShow}
      backgroundColor={colors.primary}
      borderColor={colors.lightGray + "40"}
    >
      <View style={styles.container}>
        <Text type="header" color={colors.white}>
          Customise Collage
        </Text>

        <CustomiseCollage />

        <View style={styles.buttonContainer}>
          <Button
            text="Save"
            onPress={() => {
              setShow(false);
            }}
            color={colors.primaryTint}
            textColor={colors.white}
            flex={1}
            leadingIcon="check"
          />
        </View>
      </View>
    </ModalView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 12
  },
  container: {
    alignItems: "center",
    gap: 12
  }
});
