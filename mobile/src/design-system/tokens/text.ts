import { Platform } from "react-native";

export type TextType =
  | "title"
  | "header"
  | "subHeader"
  | "body"
  | "caption"
  | "footnote";

export type TextStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight?: number;
  textAlign?: "center" | "left" | "right";
  textTransform?: "uppercase" | "lowercase" | "capitalize";
  letterSpacing?: number;
};
const defaultText: Record<TextType, TextStyle> = {
  title: {
    fontFamily: "playfairRegular",
    fontSize: 36,
    lineHeight: 48,
    textAlign: "center"
  },
  header: {
    fontFamily: "playfairRegular",
    fontSize: 24,
    lineHeight: 30,
    textAlign: "center"
  },
  subHeader: {
    fontFamily: "poppinsMedium",
    textTransform: "uppercase",
    fontSize: 16,
    letterSpacing: 1
  },
  body: {
    fontFamily: "poppinsRegular",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1
  },
  caption: {
    fontFamily: "poppinsRegular",
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 1
  },
  footnote: {
    fontFamily: "poppinsRegular",
    textTransform: "uppercase",
    fontSize: 8,
    letterSpacing: 1
  }
};

function getAndroidTextStyle(baseStyle: any = {}) {
  if (Platform.OS === "android") {
    return {
      ...baseStyle,
      includeFontPadding: false,
      textAlignVertical: "center"
    };
  }
  return baseStyle;
}

export const textStyles = Object.fromEntries(
  Object.entries(defaultText).map(([key, style]) => [
    key,
    getAndroidTextStyle(style)
  ])
) as typeof defaultText;
