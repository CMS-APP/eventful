import { Text } from "@/components/text/Text";
import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { View } from "react-native";

import { getRSVPWebUsers } from "@/services/firebase/firebaseInviteFunctions";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { UserInvite } from "@/types/UserInvite";

interface InviteLinkGuestsProps {
  event: Event;
}

export function InviteLinkGuests({ event }: InviteLinkGuestsProps) {
  const userId = useSelector((state: UserState) => state.uid);
  const [linkList, setLinkList] = useState<UserInvite[]>([]);

  const fetchData = useCallback(async () => {
    const linkList = await getRSVPWebUsers(event as Event, userId);
    setLinkList(linkList);
  }, [event, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <View>
      {linkList.length > 0 &&
        linkList.map((user) => (
          <Text key={user.user.uid}>{user.user.name}</Text>
        ))}
    </View>
  );
}
