import { useSelector } from "react-redux";

import { useCallback, useState } from "react";

import { StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Entypo } from "@expo/vector-icons";

import { EventInviteStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { Text } from "@/design-system/components/text/Text";
import { card } from "@/design-system/tokens/card";
import { colors } from "@/design-system/tokens/colors";
import { textFormatter } from "@/design-system/tokens/fonts";
import { ResponseButtonIcon } from "@/features/events/components/invite/ResponseButtonIcon";
import { formatEventAddressDisplay } from "@/services/address/eventAddress";
import { trackInviteResponseChanged } from "@/services/analytics/events";
import { updateResponseInDatabase } from "@/services/firebase/invite";
import { openInMaps } from "@/services/maps/openInMaps";
import { updateResponseNotification } from "@/services/pushNotifications";
import { UserState } from "@/store/UserSlice";
import { log } from "@/utils/logging";
import { showErrorToast } from "@/utils/toast";

import { InviteButtons } from "../components/InviteButtons";
import { InviteDateView } from "../components/InviteDateView";
import { InviteDateViewMulti } from "../components/InviteDateViewMulti";

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

  return (
    <View style={styles.screenContainer}>
      <Screen
        headerConfig={{
          type: "flat",
          backgroundColor: colors.white,
          flatHeaderProps: {
            title: "Invite",
            backAction: true
          }
        }}
        contentConfig={{
          tabBarPresent: false
        }}
      >
        <View style={styles.container}>
          <Text type="subHeader" style={styles.eventText} center>
            You Are Invited To
          </Text>
          <Text type="header" style={styles.eventText} center>
            {(host.firstName ?? host.name) + "'s"}
          </Text>
          <Text type="subHeader" style={styles.eventText} center>
            {textFormatter(event.name.trim(), 50, "Event")}
          </Text>

          {event.multiDate && event.endDate ? (
            <View>
              <View style={styles.dateLabelsRow}>
                <Text type="subHeader" style={styles.startDateLabel}>
                  Start Date
                </Text>

                <Text type="subHeader" style={styles.endDateLabel}>
                  End Date
                </Text>
              </View>

              <View style={styles.dateContainer}>
                <InviteDateViewMulti
                  date={event.date}
                  startDate={true}
                  endDate={false}
                />

                {event.multiDate && event.endDate && (
                  <InviteDateViewMulti
                    date={event.endDate}
                    startDate={false}
                    endDate={true}
                  />
                )}
              </View>
            </View>
          ) : (
            <InviteDateView date={event.date} />
          )}

          {address && (
            <TouchableOpacity onPress={() => openInMaps(address)}>
              <View style={styles.locationIcon}>
                <Entypo name="location-pin" size={50} color={colors.black} />
              </View>
              <View style={styles.addressContainer}>
                <Text type="subHeader" center>
                  {address}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {event.theme && event.theme.length > 0 && (
            <Text
              type="subHeader"
              color={colors.black}
              style={styles.themeText}
            >
              Theme: {event.theme}
            </Text>
          )}

          <View>
            <Text type="header" style={styles.rsvpText}>
              RSVP
            </Text>

            <View style={styles.responseButtonsContainer}>
              <ResponseButtonIcon
                icon={"check"}
                title="accept"
                color={colors.primary}
                updateResponse={handleUpdateResponse}
                response={response}
              />

              <ResponseButtonIcon
                icon={"question"}
                title="maybe"
                color={colors.secondary}
                updateResponse={handleUpdateResponse}
                response={response}
              />

              <ResponseButtonIcon
                icon={"times"}
                title="decline"
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
  addressContainer: {
    alignItems: "center",
    borderColor: colors.secondary,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 12,
    padding: 12
  },
  container: {
    borderColor: colors.secondary,
    borderRadius: 30,
    borderWidth: 3,
    marginHorizontal: 12,
    padding: 12
  },
  dateContainer: {
    ...card.medium,
    alignItems: "center",
    flexDirection: "row",
    gap: 60,
    justifyContent: "center",
    marginHorizontal: 12
  },
  dateLabelsRow: {
    flexDirection: "row",
    gap: 60,
    marginBottom: 12,
    marginHorizontal: 12
  },
  endDateLabel: {
    color: colors.secondary,
    flex: 1,
    textAlign: "center"
  },
  eventText: {
    marginTop: 6
  },
  locationIcon: {
    alignItems: "center",
    marginBottom: 6,
    marginTop: 12
  },
  responseButtonsContainer: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "center"
  },
  rsvpText: {
    flex: 1,
    marginBottom: 12,
    marginTop: 12,
    textAlign: "center"
  },
  screenContainer: {
    backgroundColor: colors.white,
    flex: 1
  },
  startDateLabel: {
    color: colors.primary,
    flex: 1,
    textAlign: "center"
  },
  themeText: {
    marginTop: 12,
    textAlign: "center"
  }
});
