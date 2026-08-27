import { FontAwesome5 } from "@expo/vector-icons";

export interface CurvyHeaderProps {
  title: string;
  subTitle?: string;
  backAction?: boolean | (() => void);
  color?: string;
  backgroundColor?: string;
  arcCutoutColor?: string;
  accountButton?: boolean;
  icon?: keyof typeof FontAwesome5.glyphMap | null;
}

export interface FlatHeaderProps {
  title: string;
  iconRight?: keyof typeof FontAwesome5.glyphMap;
  iconRightAction?: () => void;
  backAction?: boolean | (() => void);
  dark?: boolean;
  icon?: keyof typeof FontAwesome5.glyphMap | null;
  backgroundColor?: string;
}
