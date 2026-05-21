import { Platform, StyleSheet } from "react-native";

export const fonts = {
  "Gotham-Bold": require("@/assets/fonts/Gotham-Bold.otf"),
  "Playfair-Variable": require("@/assets/fonts/Playfair-Variable.ttf"),
  "Poppins-Regular": require("@/assets/fonts/Poppins-Regular.ttf"),
  "Poppins-Medium": require("@/assets/fonts/Poppins-Medium.ttf"),
  "Poppins-Medium-Italic": require("@/assets/fonts/Poppins-Medium-Italic.ttf"),
  "Anton-Regular": require("@/assets/fonts/Anton-Regular.ttf"),
  "BebasNeue-Regular": require("@/assets/fonts/BebasNeue-Regular.ttf"),
  Lobster: require("@/assets/fonts/Lobster.otf"),
  "GreatVibes-Regular": require("@/assets/fonts/GreatVibes-Regular.ttf")
};

const androidFontAdjustments =
  Platform.OS === "android"
    ? {
        letterSpacing: 0.5,
        fontWeight: "400" as const
      }
    : {};

export const fontStyles = StyleSheet.create({
  anton: {
    fontFamily: "Anton-Regular",
    fontSize: 24,
    ...androidFontAdjustments
  },
  bebasNeue: {
    fontFamily: "BebasNeue-Regular",
    fontSize: 24,
    ...androidFontAdjustments
  },
  body: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    letterSpacing: Platform.OS === "android" ? 1.5 : 2,
    textTransform: "uppercase",
    ...androidFontAdjustments
  },
  gotham: {
    fontFamily: "Gotham-Bold",
    fontSize: 24,
    ...androidFontAdjustments
  },
  playfair: {
    fontFamily: "Playfair-Variable",
    fontSize: 24,
    ...androidFontAdjustments
  },
  greatVibes: {
    fontFamily: "GreatVibes-Regular",
    fontSize: 24,
    ...androidFontAdjustments
  },
  lobster: {
    fontFamily: "Lobster",
    fontSize: 24,
    ...androidFontAdjustments
  },
  poppinsMedium: {
    fontFamily: "Poppins-Medium",
    fontSize: 24,
    ...androidFontAdjustments
  },
  poppinsMediumItalic: {
    fontFamily: "Poppins-Medium-Italic",
    fontSize: 24,
    ...androidFontAdjustments
  },
  poppinsRegular: {
    fontFamily: "Poppins-Regular",
    fontSize: 24,
    ...androidFontAdjustments
  }
});

export function textFormatter(text: string, maxNum = 50, noneText = "...") {
  if (text) {
    if (text.length > 50) {
      return `${text.substring(0, maxNum).trim()}...`;
    } else {
      return text;
    }
  } else {
    return noneText;
  }
}

export function getAndroidTextStyle(baseStyle: any = {}) {
  if (Platform.OS === "android") {
    return {
      ...baseStyle,
      includeFontPadding: false,
      textAlignVertical: "center"
    };
  }
  return baseStyle;
}
