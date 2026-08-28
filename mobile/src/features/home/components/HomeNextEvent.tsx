import { useCallback } from "react";

import {
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { EventsStackParamList, MainStackParamList } from "@/app/navigation";
import { Text } from "@/design-system/components/text/Text";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { Event } from "@/types/Event";
import { haptics } from "@/utils/haptics";

import { useNextEvent } from "../hooks/useNextEvent";
import { HomeNextEventPictureRow } from "./HomeNextEventPictureRow";
import { NextEventCountdown } from "./NextEventCountdown";
import { SemiCircleProgressBar } from "./SemiCircleProgressBar";

interface HomeNextEventProps {
  title?: boolean;
  event?: Event | null;
  edit?: boolean;
}

export function HomeNextEvent({
  title = true,
  event = null,
  edit = false
}: HomeNextEventProps) {
  const navigation = useNavigation() as StackNavigationProp<MainStackParamList>;
  const eventNav = useNavigation() as StackNavigationProp<EventsStackParamList>;
  const { nextEvent, percentageComplete, accepted } = useNextEvent(event);

  const goToEvent = useCallback(() => {
    if (!navigation || edit) return;
    navigation.reset({
      index: 0,
      routes: [{ name: "Events" }]
    });
    setTimeout(() => {
      if (nextEvent) {
        navigation.navigate("Events", {
          screen: "EventEdit",
          params: { event: nextEvent as Event | null }
        });
      }
    }, 100);
  }, [navigation, edit, nextEvent]);

  const goToUserInvites = useCallback(() => {
    haptics.soft();
    if (!edit) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Events" }]
      });
      if (nextEvent) {
        setTimeout(() => {
          navigation.navigate("Events", {
            screen: "EventEdit",
            params: { event: nextEvent as Event }
          });
        }, 100);
      }
    } else {
      if (nextEvent) {
        eventNav.navigate("EventEditSection", {
          event: nextEvent,
          section: "Invites"
        });
      }
    }
  }, [navigation, edit, nextEvent, eventNav]);

  return (
    <TouchableWithoutFeedback onPress={goToEvent}>
      <View style={styles.container}>
        {nextEvent && (
          <View style={styles.contentContainer}>
            {title && (
              <Text
                type="header"
                color={colors.black}
                numberOfLines={1}
                style={styles.headerText}
              >
                {nextEvent.name.trim() || "Event"}
              </Text>
            )}

            <View style={styles.invitesRow}>
              <View style={styles.invitesLeftEdge} />
              <View style={styles.invitesButton}>
                <FontAwesome5 name="envelope" size={20} color={colors.black} />
                <Text type="body" color={colors.black}>
                  Invites
                </Text>
              </View>

              <TouchableOpacity
                onPress={goToUserInvites}
                hitSlop={getHitSlop("medium")}
              >
                {accepted.length > 0 ? (
                  <HomeNextEventPictureRow accepted={accepted} />
                ) : (
                  <View style={styles.addGuestsRow}>
                    <View style={styles.addGuestsIcon}>
                      <FontAwesome5
                        name="user-plus"
                        size={20}
                        color={colors.white}
                      />
                    </View>
                    <Text type="body" color={colors.black}>
                      Add Guests...
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <NextEventCountdown event={nextEvent} />
              <SemiCircleProgressBar
                percentage={percentageComplete}
                title="Progress"
                showProgress={true}
                colorScheme={[
                  colors.primary,
                  colors.primaryTint,
                  colors.transparent
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  addGuestsIcon: {
    alignItems: "center",
    backgroundColor: colors.primaryTint,
    borderRadius: 24,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  addGuestsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  container: {
    marginBottom: 12
  },
  contentContainer: {
    gap: 4,
    paddingHorizontal: 24
  },
  headerText: {
    marginTop: 12,
    textAlign: "center"
  },
  invitesButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    height: 50,
    justifyContent: "center",
    padding: 12
  },
  invitesLeftEdge: {
    backgroundColor: colors.white,
    height: 50,
    left: -30,
    position: "absolute",
    top: 0,
    width: 30
  },
  invitesRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    gap: 6
  }
});
