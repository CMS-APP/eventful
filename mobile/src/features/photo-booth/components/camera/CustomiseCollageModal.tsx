import { StyleSheet, View } from "react-native";

import { ModalView } from "@/components/views/ModalView";
import { Button } from "@/design-system/components/Button";
import { Text } from "@/design-system/components/Text";
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
    <ModalView show={show} setShow={setShow} backgroundColor={colors.white}>
      <View style={styles.container}>
        <Text type="header">Customise Collage</Text>

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
