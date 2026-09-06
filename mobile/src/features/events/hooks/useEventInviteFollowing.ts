import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

import { getInvitedGuests } from "@/services/firebase/invite";
import {
  getUserFollowing,
  getUsersFromFollowing
} from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { User } from "@/types/User";
import { UserInvite } from "@/types/UserInvite";
import { isValidUserId } from "@/utils/userId";

export interface InviteGuest {
  user: User;
  invited: boolean;
  inviteId: string | null;
}

export function useEventInviteFollowing(event: Event) {
  const [guests, setGuests] = useState<InviteGuest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<InviteGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const userId = useSelector((state: UserState) => state.uid);

  const fetchData = useCallback(async () => {
    if (!isValidUserId(userId)) {
      setLoading(false);
      return;
    }

    const [invitedGuests, userFollowing] = await Promise.all([
      getInvitedGuests(event, userId),
      getUserFollowing(userId)
    ]);
    const invitedUserIds = new Set(
      invitedGuests.map(({ user }: UserInvite) => user.uid)
    );

    const followingUsers = await getUsersFromFollowing(
      userFollowing,
      "Following"
    );
    const nonInvitedUsers = followingUsers.filter(
      (user: User) => !invitedUserIds.has(user.uid)
    );

    const allGuests: InviteGuest[] = [
      ...invitedGuests.map(({ user, invite }: UserInvite) => ({
        user,
        invited: true,
        inviteId: invite.id
      })),
      ...nonInvitedUsers.map((user: User) => ({
        user,
        invited: false,
        inviteId: null
      }))
    ].sort((a, b) => a.user.name.localeCompare(b.user.name));

    setGuests(allGuests);
    setLoading(false);
  }, [userId, event]);

  useEffect(() => {
    const lowercasedSearch = search.trim().toLowerCase();
    if (!lowercasedSearch) {
      setFilteredGuests(guests);
      return;
    }
    setFilteredGuests(
      guests.filter(
        ({ user }) =>
          user.username.includes(lowercasedSearch) ||
          (user.searchName?.includes(lowercasedSearch) ?? false)
      )
    );
  }, [search, guests]);

  const refreshInvites = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  return {
    guests: filteredGuests,
    loading,
    search,
    setSearch,
    refreshInvites
  };
}
