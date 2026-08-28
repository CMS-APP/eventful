import { useSelector } from "react-redux";

import { useCallback, useEffect, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { AllStackParamList } from "@/app/navigation";
import { getInvitedGuests } from "@/services/firebase/invite";
import {
  getUserFollowing,
  getUsersFromFollowing
} from "@/services/firebase/user";
import { UserState } from "@/store/UserSlice";
import { Event } from "@/types/Event";
import { User } from "@/types/User";
import { UserInvite } from "@/types/UserInvite";

export function useEventInviteFollowing(
  navigation: StackNavigationProp<AllStackParamList>,
  event: Event
) {
  const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
  const [filteredInvitedUsers, setFilteredInvitedUsers] = useState<User[]>([]);
  const [nonInvitedUsers, setNonInvitedUsers] = useState<User[]>([]);
  const [filteredNonInvitedUsers, setFilteredNonInvitedUsers] = useState<
    User[]
  >([]);
  const [search, setSearch] = useState("");
  const userId = useSelector((state: UserState) => state.uid);

  const sortUsers = useCallback((users: User[]) => {
    return (
      users?.sort((a, b) => {
        return a.name.localeCompare(b.name);
      }) ?? []
    );
  }, []);

  const fetchData = useCallback(async () => {
    const invitedGuests = await getInvitedGuests(event, userId);
    const invitedUsers = invitedGuests.map((invite: UserInvite) => invite.user);
    setInvitedUsers(invitedUsers);
    setFilteredInvitedUsers(sortUsers(invitedUsers ?? []));

    const userFollowing = await getUserFollowing(userId);
    const users = await getUsersFromFollowing(userFollowing, "Following");

    const nonInvitedUsers = users.filter(
      (user: User) =>
        !invitedGuests.some(
          (invite: UserInvite) => invite.user.uid === user.uid
        )
    );
    setNonInvitedUsers(nonInvitedUsers);
    setFilteredNonInvitedUsers(sortUsers(nonInvitedUsers ?? []));
  }, [userId, event, sortUsers]);

  const handleSearch = useCallback(() => {
    if (!search) {
      setFilteredInvitedUsers(invitedUsers ?? []);
      setFilteredNonInvitedUsers(sortUsers(nonInvitedUsers ?? []));
      return;
    }
    const lowercasedSearch = search.toLowerCase();
    const filteredInvitedUsers = invitedUsers?.filter(
      (user: User) =>
        user.username.includes(lowercasedSearch) ||
        (user.searchName?.includes(lowercasedSearch) ?? false)
    );
    const filteredNonInvitedUsers = nonInvitedUsers?.filter(
      (user: User) =>
        user.username.includes(lowercasedSearch) ||
        (user.searchName?.includes(lowercasedSearch) ?? false)
    );
    setFilteredInvitedUsers(sortUsers(filteredInvitedUsers ?? []));
    setFilteredNonInvitedUsers(sortUsers(filteredNonInvitedUsers ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortUsers]);

  const refreshInvites = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return {
    filteredInvitedUsers,
    filteredNonInvitedUsers,
    search,
    setSearch,
    refreshInvites
  };
}
