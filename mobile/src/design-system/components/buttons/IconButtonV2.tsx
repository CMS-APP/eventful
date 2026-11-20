import { TouchableOpacity } from "react-native";

import { FontAwesome6 } from "@expo/vector-icons";

import { getHitSlop } from "@/design-system/tokens/hitSlop";

type IconButtonV2Props = {
  icon: string;
  color: string;
  size?: "small" | "medium" | "large";
  onPress: () => void;
};

export function IconButtonV2({
  icon,
  color,
  size = "medium",
  onPress
}: IconButtonV2Props) {
  const hitSlop = getHitSlop(size);

  const sizeMap = {
    small: 16,
    medium: 20,
    large: 24
  };

  return (
    <TouchableOpacity onPress={onPress} hitSlop={hitSlop}>
      <FontAwesome6 name={icon} color={color} size={sizeMap[size]} />
    </TouchableOpacity>
  );
}
