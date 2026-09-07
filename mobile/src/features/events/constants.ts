export const TIMELINE_TEXT_LIST: string[] = [
  "Plan Event",
  "Confirm Venue",
  "Invite",
  "Plan Entertainment",
  "Sort Food, Drinks & Snacks",
  "Make Playlist",
  "Decor",
  "Shopping List",
  "Buy Supplies",
  "Prep",
  "Party"
];

interface TimelineAction {
  screen: string;
  params?: Record<string, string>;
}

export const TIMELINE_ACTIONS: (TimelineAction | null)[] = [
  { screen: "EventEditSection", params: { section: "Details" } },
  { screen: "EventEditSection", params: { section: "Location" } },
  { screen: "EventEditSection", params: { section: "Invites" } },
  { screen: "EventEditSection", params: { section: "Itinerary" } },
  { screen: "EventEditSection", params: { section: "Essentials" } },
  { screen: "EventEditSection", params: { section: "Music" } },
  { screen: "EventEditDecor" },
  {
    screen: "EventEditSection",
    params: { section: "To Do", initialTab: "Shopping List" }
  },
  null,
  {
    screen: "EventEditSection",
    params: { section: "To Do", initialTab: "To Do List" }
  },
  null
];
