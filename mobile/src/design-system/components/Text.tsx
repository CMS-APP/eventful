import type { ReactNode } from "react";

import { Text as RNText, TextProps as RNTextProps } from "react-native";

import { colors } from "@/design-system/tokens/colors";

import { textStyles } from "../tokens/text";

type TextType =
  | "title"
  | "header"
  | "subHeader"
  | "body"
  | "caption"
  | "footnote";

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
      ? { fontFamily: "poppinsMediumItalic" }
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
