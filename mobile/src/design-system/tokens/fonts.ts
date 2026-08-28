import { TextStyle } from "react-native";

export const fonts = {
  gothamBold: require("@/assets/fonts/Gotham-Bold.otf"),
  playfairRegular: require("@/assets/fonts/Playfair-Regular.ttf"),
  poppinsRegular: require("@/assets/fonts/Poppins-Regular.ttf"),
  poppinsMedium: require("@/assets/fonts/Poppins-Medium.ttf"),
  poppinsMediumItalic: require("@/assets/fonts/Poppins-Medium-Italic.ttf"),
  antonRegular: require("@/assets/fonts/Anton-Regular.ttf"),
  bebasNeueRegular: require("@/assets/fonts/BebasNeue-Regular.ttf"),
  lobster: require("@/assets/fonts/Lobster.otf"),
  greatVibesRegular: require("@/assets/fonts/GreatVibes-Regular.ttf")
};

export const CUSTOM_FONTS: Record<keyof typeof fonts, string> = {
  antonRegular: "Anton",
  bebasNeueRegular: "Bebas Neue",
  lobster: "Lobster",
  greatVibesRegular: "Great Vibes",
  playfairRegular: "Playfair",
  gothamBold: "Gotham Bold",
  poppinsRegular: "Poppins",
  poppinsMedium: "Poppins Bold",
  poppinsMediumItalic: "Poppins Bold Italic"
};

const DISPLAY_NAME_TO_FONT_FAMILY = Object.fromEntries(
  Object.entries(CUSTOM_FONTS).map(([family, name]) => [name, family])
) as Record<string, keyof typeof fonts>;

const LEGACY_CUSTOM_FONT_ALIASES: Record<string, string[]> = {
  "Gotham Bold": ["Tribune Bold", "Chloe"]
};

function resolveLegacyFontName(displayName: string): string {
  for (const [canonicalName, aliases] of Object.entries(
    LEGACY_CUSTOM_FONT_ALIASES
  )) {
    if (aliases.includes(displayName)) {
      return canonicalName;
    }
  }
  return displayName;
}

export function getCustomFontStyle(
  displayName: string,
  fontSize = 24
): TextStyle {
  const resolvedName = resolveLegacyFontName(displayName);
  const fontFamily =
    DISPLAY_NAME_TO_FONT_FAMILY[resolvedName] ??
    DISPLAY_NAME_TO_FONT_FAMILY.Poppins;
  return { fontFamily, fontSize };
}

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
