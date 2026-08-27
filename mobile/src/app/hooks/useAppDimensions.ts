import { Dimensions } from "react-native";

export const useAppDimensions = () => {
  const window = Dimensions.get("window");
  const screenWidth = window.width;
  const screenHeight = window.height;

  return { screenWidth, screenHeight };
};
