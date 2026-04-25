import { EventInvite } from "./EventInvite";

export interface Invites {
  respond: EventInvite[];
  noRespond: EventInvite[];
}
