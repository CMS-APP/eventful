import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { usePhotoBoothSettings } from "@/features/photo-booth/context/settings/PhotoBoothSettingsContext";

import { CameraCollageDiagram } from "./CameraCollageDiagram";
import { CustomiseCollageModal } from "./CustomiseCollageModal";

export function CameraSelectedCollage({
  show,
  setShow
}: {
  show: boolean;
  setShow: (show: boolean) => void;
}) {
  const { collageStyle } = usePhotoBoothSettings();
  let photoCount = 4;
  if (collageStyle === "row" || collageStyle === "column") {
    photoCount = 3;
  }
  if (collageStyle === "single") {
    photoCount = 1;
  }

  const isColumnStyle = collageStyle === "column";

  const textBlock = (
    <View
      style={[styles.textContainer, isColumnStyle && styles.textContainerRow]}
    >
      <Text type="subHeader" color={colors.white}>
        {collageStyle} Style
      </Text>
      <Text type="body" color={colors.lightGray}>
        {photoCount} {photoCount === 1 ? "Photo" : "Photos"} Total
      </Text>
    </View>
  );

  return (
    <>
      <View style={[styles.headerRow, isColumnStyle && styles.headerRowWide]}>
        <View style={styles.collageBoxContainer}>
          <CameraCollageDiagram collageStyle={collageStyle} />
        </View>

        {isColumnStyle && textBlock}
      </View>
      {!isColumnStyle && textBlock}

      <CustomiseCollageModal show={show} setShow={setShow} />
    </>
  );
}

const styles = StyleSheet.create({
  collageBoxContainer: {
    alignSelf: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    padding: 2
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  headerRowWide: {
    flex: 1,
    justifyContent: "center"
  },
  textContainer: {
    alignItems: "center"
  },
  textContainerRow: {
    alignItems: "flex-start",
    justifyContent: "center"
  }
});
