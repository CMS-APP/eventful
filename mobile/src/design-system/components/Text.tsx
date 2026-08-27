import type { ReactNode } from "react";

import {
  Platform,
  Text as RNText,
  TextProps as RNTextProps
} from "react-native";

import { colors } from "@/design-system/tokens/colors";

type TextType =
  | "title"
  | "header"
  | "subHeader"
  | "body"
  | "caption"
  | "footnote";

const textStyles = {
  title: {
    fontFamily: "Playfair-Variable",
    fontSize: 36,
    textAlign: "center"
  },
  header: {
    fontFamily: "Playfair-Variable",
    fontSize: 24,
    textAlign: "center"
  },
  subHeader: {
    fontFamily: "Poppins-Medium",
    textTransform: "uppercase",
    fontSize: 16,
    letterSpacing: Platform.OS === "android" ? 1.5 : 2
  },
  body: {
    fontFamily: "Poppins-Regular",
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: Platform.OS === "android" ? 1.5 : 2
  },
  caption: {
    fontFamily: "Poppins-Regular",
    textTransform: "uppercase",
    fontSize: 10
  },
  footnote: {
    fontFamily: "Poppins-Regular",
    textTransform: "uppercase",
    fontSize: 8
  }
};

interface TextProps extends RNTextProps {
  children: ReactNode;
  type?: TextType;
  color?: string;
  italic?: boolean;
  center?: boolean;
}

export function Text({
  children,
  type,
  color = colors.black,
  italic = false,
  style,
  center = false,
  ...props
}: TextProps) {
  const textStyle = textStyles[type ?? "body"];
  const italicStyle =
    italic && (type ?? "body") !== "header"
      ? { fontFamily: "Poppins-Medium-Italic" }
      : undefined;
  const textAlign = center ? "center" : "left";

  return (
    <RNText
      allowFontScaling={false}
      style={[textStyle, italicStyle, { color, textAlign }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}
