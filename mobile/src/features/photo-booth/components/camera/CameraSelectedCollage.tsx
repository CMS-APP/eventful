import { StyleSheet, View } from "react-native";

import { Text } from "@/components/text/Text";
import { colors } from "@/styles/colors";

import { usePhotoBoothSettings } from "../../provider/PhotoBoothSettingsProvider";
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

  const isColumnStyle = collageStyle === "column";

  function CollageBox() {
    return <View style={styles.collageBox} />;
  }

  function SquareCollage() {
    return (
      <View style={styles.collageContainer}>
        <View style={styles.collageRow}>
          <CollageBox />
          <CollageBox />
        </View>
        <View style={styles.collageRow}>
          <CollageBox />
          <CollageBox />
        </View>
      </View>
    );
  }

  function RowCollage() {
    return (
      <View style={styles.collageRow}>
        <CollageBox />
        <CollageBox />
        <CollageBox />
      </View>
    );
  }

  function ColumnCollage() {
    return (
      <View style={styles.collageColumn}>
        <CollageBox />
        <CollageBox />
        <CollageBox />
      </View>
    );
  }

  const textBlock = (
    <View
      style={[styles.textContainer, isColumnStyle && styles.textContainerRow]}
    >
      <Text type="subHeader" color={colors.white}>
        {collageStyle} Style
      </Text>
      <Text type="body" color={colors.lightGray}>
        {photoCount} Photos Total
      </Text>
    </View>
  );

  return (
    <>
      <View style={[styles.headerRow, isColumnStyle && styles.headerRowWide]}>
        <View style={styles.collageBoxContainer}>
          {collageStyle === "square" && <SquareCollage />}
          {collageStyle === "row" && <RowCollage />}
          {collageStyle === "column" && <ColumnCollage />}
        </View>

        {isColumnStyle && textBlock}
      </View>
      {!isColumnStyle && textBlock}

      <CustomiseCollageModal show={show} setShow={setShow} />
    </>
  );
}

const styles = StyleSheet.create({
  collageBox: {
    backgroundColor: colors.black,
    height: 30,
    width: 30
  },
  collageBoxContainer: {
    alignSelf: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    padding: 2
  },
  collageColumn: {
    flexDirection: "column",
    gap: 2
  },
  collageContainer: {
    gap: 2
  },
  collageRow: {
    flexDirection: "row",
    gap: 2
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
