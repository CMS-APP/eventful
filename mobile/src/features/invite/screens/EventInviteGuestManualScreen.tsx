import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { StyleSheet, TouchableOpacity, View } from "react-native";

import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { FontAwesome5 } from "@expo/vector-icons";

import { AllStackParamList, EventsStackParamList } from "@/app/navigation";
import { Screen } from "@/components/screen/Screen";
import { SegmentedControl } from "@/design-system/components/buttons/SegmentedControl";
import { Input } from "@/design-system/components/inputs/Input";
import { colors } from "@/design-system/tokens/colors";
import { getHitSlop } from "@/design-system/tokens/hitSlop";
import { EventInviteUserItem } from "@/features/events/components/guest-list/EventInviteUserItem";
import { updateEventInDatabase } from "@/services/firebase/event";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { Guest } from "@/types/Guest";
import { Invite } from "@/types/Invite";
import { User } from "@/types/User";
import { UserInvite } from "@/types/UserInvite";
import { generateUUID } from "@/utils/uuid";

interface EventInviteGuestManualScreenProps {
  navigation: StackNavigationProp<AllStackParamList>;
  route: RouteProp<EventsStackParamList, "EventInviteGuestManual">;
}

export function EventInviteGuestManualScreen({
  navigation,
  route
}: EventInviteGuestManualScreenProps) {
  const event = route.params?.event;
  const [guestList, setGuestList] = useState<Guest[]>(event?.guestList || []);
  const [acceptNum, setAcceptNum] = useState(0);
  const [maybeNum, setMaybeNum] = useState(0);
  const [declineNum, setDeclineNum] = useState(0);
  const [selectedButton, setSelectedButton] = useState("accept");
  const [sortedGuestList, setSortedGuestList] = useState<UserInvite[]>([]);
  const [newGuest, setNewGuest] = useState("");

  const userId = useSelector((state: UserState) => state.uid);

  const setResponse = useCallback(
    async (user: UserInvite, response: string) => {
      const newGuestList = [...guestList];
      const index = newGuestList.findIndex(
        (guest) => guest.id === user.user.uid
      );
      if (index !== -1) {
        newGuestList[index].response = response;
        setGuestList(newGuestList);
      }
    },
    [guestList]
  );

  const addGuest = useCallback(
    (name: string) => {
      const newGuestList = [...guestList];
      newGuestList.push({
        id: generateUUID(),
        name: name,
        response: selectedButton,
        type: "manual"
      });
      setGuestList(newGuestList);
    },
    [guestList, selectedButton]
  );

  const deleteGuest = useCallback(
    async (user: UserInvite) => {
      const newGuestList = [...guestList];
      const index = newGuestList.findIndex(
        (guest: Guest) => guest.id === user.user.uid
      );
      if (index !== -1) {
        newGuestList.splice(index, 1);
        setGuestList(newGuestList);
      }
    },
    [guestList]
  );

  const checkInput = useCallback(() => {
    const trimmedName = newGuest.trim();
    if (trimmedName.length === 0) {
      return false;
    }

    return true;
  }, [newGuest]);

  const handleAddGuest = useCallback(() => {
    if (!checkInput()) {
      return;
    }
    addGuest(newGuest);
    setNewGuest("");
  }, [addGuest, newGuest, checkInput]);

  const refreshUsers = useCallback(() => {}, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const newEvent = { ...event };
      newEvent.guestList = guestList;
      updateEventInDatabase(newEvent);
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [guestList, event]);

  useEffect(() => {
    let finalGuestList: Guest[] = [];

    const acceptCount = guestList.filter(
      (user: Guest) => user.response === "accept"
    ).length;
    const maybeCount = guestList.filter(
      (user: Guest) => user.response === "maybe"
    ).length;
    const declineCount = guestList.filter(
      (user: Guest) => user.response === "decline"
    ).length;

    if (selectedButton === "accept") {
      finalGuestList = guestList.filter(
        (user: Guest) => user.response === "accept"
      );
    } else if (selectedButton === "maybe") {
      finalGuestList = guestList.filter(
        (user: Guest) => user.response === "maybe"
      );
    } else if (selectedButton === "decline") {
      finalGuestList = guestList.filter(
        (user: Guest) => user.response === "decline"
      );
    }

    setAcceptNum(acceptCount);
    setMaybeNum(maybeCount);
    setDeclineNum(declineCount);

    setSortedGuestList(
      finalGuestList.map((guest: Guest) => {
        const user: User = {
          uid: guest.id,
          name: guest.name,
          username: "",
          email: "",
          emailVerified: false,
          pushTokens: [],
          firstName: "",
          lastName: "",
          searchName: guest.name
        };

        const invite: Invite = {
          id: guest.id,
          type: "manual",
          response: guest.response,
          recipient: guest.id,
          sender: userId,
          eventId: event?.id || ""
        };
        return { user, invite };
      })
    );
  }, [guestList, selectedButton, userId, event]);

  return (
    <Screen
      headerConfig={{
        type: "flat",
        flatHeaderProps: {
          title: "Manual Guests",
          backgroundColor: colors.darkGray,
          dark: true,
          backAction: true,
          icon: "users"
        },
        backgroundColor: colors.darkGray
      }}
      contentConfig={{
        backgroundColor: colors.darkGray
      }}
    >
      <SegmentedControl
        selections={["accept", "maybe", "decline"]}
        selectionValues={[
          acceptNum.toString(),
          maybeNum.toString(),
          declineNum.toString()
        ]}
        selectedButton={selectedButton}
        setSelectedButton={setSelectedButton}
        nonPressColor={colors.white}
      />

      <View style={styles.userListContainer}>
        {sortedGuestList.map((user: UserInvite, index: number) => {
          return (
            <EventInviteUserItem
              key={user.user.uid}
              user={user.user}
              invite={user.invite}
              event={event as Event}
              refreshUsers={refreshUsers}
              deleteGuestManual={deleteGuest}
              setResponseManual={setResponse}
            />
          );
        })}

        <View style={styles.inputContainer}>
          <View style={styles.inputContainerInner}>
            <Input
              placeholder={"New Guest Name"}
              onChangeText={setNewGuest}
              value={newGuest}
              backgroundColor={colors.lightGray}
              textColor={colors.black}
              dark
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddGuest}
            hitSlop={getHitSlop("medium")}
          >
            <FontAwesome5 name="plus" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addButton: {
    marginBottom: 12
  },
  inputContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12
  },
  inputContainerInner: {
    flex: 1
  },
  userListContainer: {
    gap: 12,
    marginHorizontal: 12,
    marginTop: 12
  }
});
