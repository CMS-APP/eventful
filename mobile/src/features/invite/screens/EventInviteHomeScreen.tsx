import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Entypo, FontAwesome5 } from "@expo/vector-icons";

import { EventInviteStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { textFormatter } from "@/design-system/tokens/fonts";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { formatEventAddressDisplay } from "@/services/address/eventAddress";
import { trackInviteResponseChanged } from "@/services/analytics/events";
import { updateResponseInDatabase } from "@/services/firebase/invite";
import { openInMaps } from "@/services/maps/openInMaps";
import { updateResponseNotification } from "@/services/pushNotifications";
import { UserState } from "@/store/UserSlice";
import { parseDatabaseDate } from "@/utils/date";
import { haptics } from "@/utils/haptics";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { InviteButtons } from "../components/InviteButtons";
import { InviteDateView } from "../components/InviteDateView";
import { InviteDateViewMulti } from "../components/InviteDateViewMulti";
import { InviteRSVPButton } from "../components/InviteRSVPButton";

type EventInviteHomeScreenProps = NativeStackScreenProps<
  EventInviteStackParamList,
  "EventInviteHome"
>;

export function EventInviteHomeScreen({
  navigation,
  route
}: EventInviteHomeScreenProps) {
  const { invite, event, host } = route.params;
  const name = useSelector((state: UserState) => state.name);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle("dark-content");
      return () => StatusBar.setBarStyle("light-content");
    }, [])
  );
  const username = useSelector((state: UserState) => state.username);
  const [response, setResponse] = useState(invite.response);
  const address = formatEventAddressDisplay(event.address);

  const handleUpdateResponse = useCallback(
    async (newResponse: string) => {
      try {
        setResponse(newResponse);
        await updateResponseInDatabase(invite, { response: newResponse });
        trackInviteResponseChanged(newResponse);
        await updateResponseNotification(
          host,
          name,
          username,
          event,
          newResponse
        );
      } catch (error) {
        log(`Error Updating Response: ${error}`, "error");
        showErrorToast("Error Updating Response");
      }
    },
    [invite, host, name, username, event]
  );

  const duration =
    event.multiDate && event.endDate
      ? (() => {
          const start = parseDatabaseDate(event.date);
          const end = parseDatabaseDate(event.endDate);
          const nights = Math.round(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          );
          return { nights, days: nights + 1, year: end.getFullYear() };
        })()
      : null;

  return (
    <View style={styles.screenContainer}>
      <Screen
        headerConfig={{
          backgroundColor: colors.white
        }}
        contentConfig={{
          tabBarPresent: false
        }}
      >
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                haptics.soft();
                navigation.goBack();
              }}
              hitSlop={getHitSlop("small")}
            >
              <FontAwesome5 name="arrow-left" size={22} color={colors.black} />
            </TouchableOpacity>

            <View style={styles.envelopeCircle}>
              <FontAwesome5 name="envelope" size={26} color={colors.primary} />
            </View>
          </View>

          <Text
            type="caption"
            color={colors.gray}
            style={styles.eventText}
            center
          >
            You Are Invited To
          </Text>
          <Text
            type="title"
            color={colors.primary}
            style={styles.eventText}
            center
          >
            {(host.firstName ?? host.name) + "'s"}
          </Text>
          <Text
            type="subHeader"
            color={colors.black}
            style={styles.eventText}
            center
          >
            {textFormatter(event.name.trim(), 50, "Event")}
          </Text>

          <View style={styles.divider} />

          {event.multiDate && event.endDate ? (
            <View>
              <View style={styles.dateRow}>
                <InviteDateViewMulti
                  date={event.date}
                  startDate={true}
                  endDate={false}
                />

                <View style={styles.middleColumn}>
                  <View style={styles.verticalDivider} />
                  <View style={styles.arrowBox}>
                    <FontAwesome5
                      name="arrow-right"
                      size={14}
                      color={colors.secondary}
                    />
                  </View>
                </View>

                <InviteDateViewMulti
                  date={event.endDate}
                  startDate={false}
                  endDate={true}
                />
              </View>

              {duration && <View style={styles.divider} />}

              {duration && (
                <View style={styles.durationPill}>
                  <FontAwesome5 name="clock" size={12} color={colors.primary} />
                  <Text type="caption" color={colors.primary}>
                    {duration.days} Days · {duration.nights} Nights ·{" "}
                    {duration.year}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <InviteDateView date={event.date} />
          )}

          {address && (
            <TouchableOpacity
              style={styles.addressRow}
              onPress={() => openInMaps(address)}
            >
              <View style={styles.addressIconCircle}>
                <Entypo name="location-pin" size={18} color={colors.primary} />
              </View>
              <Text
                type="subHeader"
                color={colors.black}
                style={styles.addressText}
              >
                {address}
              </Text>
            </TouchableOpacity>
          )}

          {event.theme && event.theme.length > 0 && (
            <Text
              type="body"
              color={colors.gray}
              style={styles.themeText}
              center
            >
              Theme: {event.theme}
            </Text>
          )}

          <View style={styles.rsvpSection}>
            <Text type="header" style={styles.rsvpText}>
              RSVP
            </Text>

            <View style={styles.responseButtonsContainer}>
              <InviteRSVPButton
                icon="check"
                label="Accept"
                value="accept"
                color={colors.primary}
                updateResponse={handleUpdateResponse}
                response={response}
              />

              <InviteRSVPButton
                icon="question"
                label="Maybe"
                value="maybe"
                color={colors.secondary}
                updateResponse={handleUpdateResponse}
                response={response}
              />

              <InviteRSVPButton
                icon="times"
                label="Decline"
                value="decline"
                color={colors.tertiary}
                updateResponse={handleUpdateResponse}
                response={response}
              />
            </View>
          </View>

          <InviteButtons event={event} invite={invite} host={host} />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  addressIconCircle: {
    ...card.small,
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  addressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 8
  },
  addressText: {
    flex: 1
  },
  arrowBox: {
    ...card.small,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 8,
    height: 32,
    justifyContent: "center",
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -16 }],
    width: 32
  },
  backButton: {
    left: 0,
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -16 }],
    width: 32
  },
  container: {
    paddingBottom: 40,
    paddingHorizontal: 20
  },
  dateRow: {
    flexDirection: "row"
  },
  divider: {
    backgroundColor: colors.lightGray,
    height: 1,
    marginVertical: 20
  },
  durationPill: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.secondaryTint,
    borderRadius: 20,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  envelopeCircle: {
    ...card.small,
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72
  },
  eventText: {
    marginTop: 6
  },
  headerRow: {
    alignItems: "center",
    justifyContent: "center"
  },
  middleColumn: {
    alignItems: "center",
    width: 32
  },
  responseButtonsContainer: {
    flexDirection: "row",
    gap: 12
  },
  rsvpSection: {
    marginTop: 8
  },
  rsvpText: {
    marginBottom: 16
  },
  screenContainer: {
    backgroundColor: colors.white,
    flex: 1
  },
  themeText: {
    marginTop: 16
  },
  verticalDivider: {
    backgroundColor: colors.lightGray,
    bottom: 0,
    left: 15,
    position: "absolute",
    top: 0,
    width: 1
  }
});
