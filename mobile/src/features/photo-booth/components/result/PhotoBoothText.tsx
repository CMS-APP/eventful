import { useCallback } from "react";

import { Image, StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/Text";
import { fontStyles } from "@/design-system/tokens/fonts";

import { usePhotoBoothSettings } from "../../provider/PhotoBoothSettingsProvider";

export function PhotoBoothText({
  collage
}: {
  collage?: "column" | "grid" | "row";
}) {
  const {
    title,
    subTitle,
    frameColor,
    textColor,
    removeWatermark,
    customTitleFont,
    customTitleFontSize,
    customSubTitleFont,
    customSubTitleFontSize
  } = usePhotoBoothSettings();

  const hexToRgb = useCallback((hex: string) => {
    const [r, g, b] = hex
      .match(/\w\w/g)
      ?.map((x: string) => parseInt(x, 16)) || [0, 0, 0];
    return { r, g, b };
  }, []);

  const getTextColor = useCallback(
    (backgroundColor: string) => {
      const rgb = hexToRgb(backgroundColor);
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return brightness > 128 ? "black" : "white";
    },
    [hexToRgb]
  );

  const getFontStyle = useCallback((font: string, fontSizeString: string) => {
    let fontSize = parseInt(fontSizeString);
    if (collage === "column") {
      fontSize /= 4;
    }

    if (collage === "grid") {
      fontSize /= 1.5;
    }

    if (font === "Poppins") {
      return { ...fontStyles.poppinsRegular, fontSize };
    } else if (font === "Poppins Bold") {
      return { ...fontStyles.poppinsMedium, fontSize };
    } else if (font === "Poppins Bold Italic") {
      return { ...fontStyles.poppinsMediumItalic, fontSize };
    } else if (font === "Anton") {
      return { ...fontStyles.anton, fontSize };
    } else if (font === "Bebas Neue") {
      return { ...fontStyles.bebasNeue, fontSize };
    } else if (font === "Lobster") {
      return { ...fontStyles.lobster, fontSize };
    } else if (font === "Great Vibes") {
      return { ...fontStyles.greatVibes, fontSize };
    } else if (font === "Playfair") {
      return { ...fontStyles.playfair, fontSize };
    } else if (
      font === "Tribune Bold" ||
      font === "Chloe" ||
      font === "Gotham Bold"
    ) {
      return { ...fontStyles.gotham, fontSize };
    } else {
      return { ...fontStyles.poppinsRegular, fontSize };
    }
  }, []);

  const getTextStyle = useCallback(
    (font: string, fontSizeString: string) => {
      return {
        ...getFontStyle(font, fontSizeString),
        marginVertical: collage === "column" ? 1.6 : 6,
        color: textColor
      };
    },
    [collage, textColor]
  );

  const getWatermarkContainerStyle = useCallback(() => {
    return {
      marginTop: collage === "column" ? 3.3 : 10,
      gap: collage === "column" ? 1.6 : 6
    };
  }, [collage]);

  const getWatermarkStyle = useCallback(() => {
    return {
      height: collage === "column" ? 6.6 : 15,
      width: collage === "column" ? 6.6 : 15,
      borderRadius: collage === "column" ? 1.6 : 3
    };
  }, [collage]);

  const getWatermarkTextStyle = useCallback(() => {
    return {
      fontSize:
        collage === "column"
          ? fontStyles.body.fontSize / 3
          : fontStyles.body.fontSize / 1.5,
      letterSpacing: collage === "column" ? 0.5 : 1.5
    };
  }, [collage]);

  return (
    <View
      style={
        collage === "column" || collage === "grid"
          ? styles.columnContainer
          : undefined
      }
    >
      <View style={styles.textContainer}>
        {title && (
          <Text
            style={[
              getFontStyle(customTitleFont, customTitleFontSize.toString()),
              styles.title,
              { marginTop: collage === "column" ? 1.6 : 15 }
            ]}
            color={textColor}
            adjustsFontSizeToFit
          >
            {title}
          </Text>
        )}
        {subTitle && (
          <Text
            style={[
              getTextStyle(
                customSubTitleFont,
                customSubTitleFontSize.toString()
              ),
              styles.subtitle
            ]}
            adjustsFontSizeToFit
          >
            {subTitle}
          </Text>
        )}
      </View>
      {!removeWatermark && (
        <View style={[styles.watermarkContainer, getWatermarkContainerStyle()]}>
          <Image
            source={require("@/assets/logos/eventful-logo.png")}
            style={[styles.watermarkImage, getWatermarkStyle()]}
          />

          <Text
            type="body"
            style={[
              styles.watermarkText,
              getWatermarkTextStyle(),
              { color: getTextColor(frameColor) }
            ]}
          >
            Eventful App
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  columnContainer: {
    alignSelf: "stretch",
    width: "100%"
  },
  subtitle: {
    flexWrap: "wrap",
    textAlign: "center",
    textTransform: "none",
    width: "100%"
  },
  textContainer: {
    alignItems: "center"
  },
  title: {
    alignSelf: "center",
    flexWrap: "wrap",
    textAlign: "center",
    textTransform: "none",
    width: "100%"
  },
  watermarkContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "flex-start",
    marginTop: 12
  },
  watermarkImage: {
    borderRadius: 6,
    height: 24,
    width: 24
  },
  watermarkText: {
    fontSize: 10,
    textAlign: "left"
  }
});
