import {
  Modal,
  ScrollView,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { useAppDimensions } from "@/app/hooks/useAppDimensions";
import { Divider } from "@/design-system/components/layout/Divider";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

interface DropdownProps {
  data: string[];
  textStyles?: TextStyle[];
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  placeholder: string;
  selectedItem: string;
  onSelect: (item: string) => void;
}

export function Dropdown({
  data = [],
  textStyles = [],
  isVisible,
  setIsVisible,
  placeholder = "Select option",
  selectedItem,
  onSelect
}: DropdownProps) {
  const width = useAppDimensions().screenWidth;
  const height = useAppDimensions().screenHeight;

  const handleSelect = (item: string) => {
    setIsVisible(false);
    onSelect(item);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsVisible(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsVisible(false)}
        hitSlop={getHitSlop("medium")}
      >
        <TouchableOpacity
          style={[
            styles.modalContent,
            { width: width * 0.8, maxHeight: height * 0.7 }
          ]}
          activeOpacity={1}
          onPress={(event) => event.stopPropagation()}
          hitSlop={getHitSlop("medium")}
        >
          <View style={styles.modalHeader}>
            <Text type="subHeader">{placeholder}</Text>
            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              style={styles.closeButton}
              hitSlop={getHitSlop("medium")}
            >
              <FontAwesome5 name="times" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: height * 0.5 }}
          >
            {(data || []).map((item, index) => (
              <View key={`dropdown-${item}-${index}`}>
                <TouchableOpacity
                  style={[
                    styles.dropdownItemStyle,
                    selectedItem === item && styles.selectedItemStyle
                  ]}
                  onPress={() => handleSelect(item)}
                  hitSlop={getHitSlop("medium")}
                >
                  <Text
                    type="body"
                    color={colors.black}
                    style={textStyles[index]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
                <Divider />
              </View>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    padding: 6
  },
  dropdownItemStyle: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: "100%"
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12
  },
  modalHeader: {
    alignItems: "center",
    borderBottomColor: colors.lightGray,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 24
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: colors.blackTransparent,
    flex: 1,
    justifyContent: "center"
  },
  selectedItemStyle: {
    backgroundColor: colors.lightGray
  }
});
