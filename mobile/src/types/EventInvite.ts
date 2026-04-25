import { Event } from "./Event";
import { Invite } from "./Invite";
import { User } from "./User";

export interface EventInvite {
  invite: Invite;
  event: Event;
  host?: User;
}
