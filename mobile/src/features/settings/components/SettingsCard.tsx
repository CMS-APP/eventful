import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";

import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";

export interface SettingsCardRow {
  icon: keyof typeof FontAwesome5.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  loading?: boolean;
  toggle?: {
    value: boolean;
    onToggle: () => void;
  };
}

interface SettingsCardProps {
  rows: SettingsCardRow[];
}

export function SettingsCard({ rows }: SettingsCardProps) {
  return (
    <View style={styles.container}>
      {rows.map((row, index) => {
        const tintColor = row.destructive ? colors.tertiary : colors.primary;

        return (
          <TouchableOpacity
            key={row.label}
            onPress={row.toggle ? row.toggle.onToggle : row.onPress}
            disabled={row.loading || (!row.toggle && !row.onPress)}
            hitSlop={getHitSlop("small")}
            style={[styles.row, index > 0 && styles.rowDivider]}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name={row.icon} size={18} color={tintColor} />
            </View>

            <View style={styles.labelColumn}>
              <Text
                type="subHeader"
                color={row.destructive ? colors.tertiary : colors.black}
              >
                {row.label}
              </Text>
              {row.value && (
                <Text type="body" color={colors.gray}>
                  {row.value}
                </Text>
              )}
            </View>

            {row.loading ? (
              <ActivityIndicator size="small" color={colors.gray} />
            ) : row.toggle ? (
              <Switch
                value={row.toggle.value}
                onValueChange={row.toggle.onToggle}
                trackColor={{ true: colors.primary, false: colors.lightGray }}
                thumbColor={colors.white}
                ios_backgroundColor={colors.lightGray}
              />
            ) : (
              (row.showChevron ?? true) && (
                <FontAwesome5
                  name="chevron-right"
                  size={14}
                  color={colors.gray}
                />
              )
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    width: "100%"
  },
  iconContainer: {
    alignItems: "center",
    width: 20
  },
  labelColumn: {
    flex: 1,
    gap: 2
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    paddingVertical: 16
  },
  rowDivider: {
    borderTopColor: colors.lightGray,
    borderTopWidth: 1
  }
});
