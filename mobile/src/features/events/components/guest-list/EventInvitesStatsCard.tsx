import { StyleSheet, View } from "react-native";

import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";

interface EventInvitesStatsCardProps {
  total: number;
  acceptNum: number;
  maybeNum: number;
  declineNum: number;
}

export function EventInvitesStatsCard({
  total,
  acceptNum,
  maybeNum,
  declineNum
}: EventInvitesStatsCardProps) {
  const stats = [
    { label: "Accepted", count: acceptNum, color: colors.primary },
    { label: "Maybe", count: maybeNum, color: colors.secondary },
    { label: "Declined", count: declineNum, color: colors.tertiary }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.totalColumn}>
        <Text type="title">{total}</Text>
        <Text type="caption" color={colors.gray} style={styles.totalLabel}>
          Guests Invited
        </Text>
      </View>

      <View style={styles.statsColumn}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statRow}>
            <View style={[styles.dot, { backgroundColor: stat.color }]} />
            <Text type="body" color={colors.black} style={styles.statLabel}>
              {stat.label}
            </Text>
            <Text type="subHeader" color={colors.black}>
              {stat.count}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...card.medium,
    flexDirection: "row",
    gap: 16,
    padding: 20
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8
  },
  statLabel: {
    flex: 1,
    textAlign: "left"
  },
  statRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  statsColumn: {
    borderLeftColor: colors.lightGray,
    borderLeftWidth: 1,
    flex: 1,
    gap: 12,
    paddingLeft: 16
  },
  totalColumn: {
    alignItems: "center",
    gap: 4,
    justifyContent: "center"
  },
  totalLabel: {
    textAlign: "center"
  }
});
