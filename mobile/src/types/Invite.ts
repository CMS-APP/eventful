export interface Invite {
  id: string;
  recipient: string;
  sender: string;
  eventId: string;
  response: string;
  dietary?: string;
  type?: string;
}
