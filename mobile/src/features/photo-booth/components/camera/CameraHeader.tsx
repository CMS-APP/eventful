import { StyleSheet, View } from "react-native";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";
import { globalStyles, useSafeAreaStyles } from "@/styles/globalStyles";

import { usePhotoBoothSession } from "../../provider/PhotoBoothSessionProvider";
import { CameraSelectedCollage } from "./CameraSelectedCollage";

export function CameraHeader({
  show,
  setShow
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  const { isBoothRunning } = usePhotoBoothSession();

  return (
    <View
      style={[
        globalStyles.largeWidget,
        styles.headerContainer,
        {
          backgroundColor: !isBoothRunning ? colors.black : colors.transparent,
          top: useSafeAreaStyles().safeArea.paddingTop + 24
        }
      ]}
    >
      {!isBoothRunning && (
        <View style={styles.headerContent}>
          <Text type="header" color={colors.white}>
            Photo Booth
          </Text>
          <Text type="subHeader" color={colors.white}>
            Capture This Moment
          </Text>

          <CameraSelectedCollage show={show} setShow={setShow} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    gap: 0,
    left: 30,
    opacity: 0.8,
    position: "absolute",
    right: 30
  },
  headerContent: {
    alignItems: "center",
    gap: 12,
    width: "100%"
  }
});
