import { Timestamp } from "@react-native-firebase/firestore";

import { TIMELINE_TEXT_LIST } from "@/constants/timeline";
import { generateUUID } from "@/utils/uuid";

import { BudgetItem } from "./BudgetItem";
import { Guest } from "./Guest";
import { Itinerary } from "./Itinerary";
import { ListItem } from "./ListItem";
import { SpotifyPlaylist } from "./SpotifyPlaylist";

export interface Event {
  id: string;
  userId: string;
  name: string;
  description: string;
  date: Timestamp;
  multiDate: boolean;
  endDate: Timestamp | null;
  invited: string[];
  eventLinkEnabled: boolean;
  public: boolean;
  theme: string;
  address: string;
  directions: string;
  music: string;
  playlists: SpotifyPlaylist[];
  checklist: ListItem[];
  toDoList: ListItem[];
  shoppingList: ListItem[];
  timelineList: boolean[];
  budgetMaximum: number;
  food: string;
  foodItems: BudgetItem[];
  drink: string;
  drinkItems: BudgetItem[];
  decor: string;
  decorItems: BudgetItem[];
  outfit: string;
  outfitItems: BudgetItem[];
  guestList: Guest[];
  notes?: string;
  itinerary?: Itinerary[];
}

export const NewEvent = (date: Date, userId: string, name: string): Event => {
  return {
    id: generateUUID(),
    userId: userId,
    name: name,
    description: "",
    date: Timestamp.fromDate(date),
    multiDate: false,
    endDate: null,
    invited: [],
    eventLinkEnabled: false,
    public: false,
    theme: "",
    address: "",
    directions: "",
    music: "",
    playlists: [],
    checklist: [],
    toDoList: [],
    shoppingList: [],
    timelineList: Array(TIMELINE_TEXT_LIST.length).fill(false),
    budgetMaximum: 0,
    food: "",
    foodItems: [],
    drink: "",
    drinkItems: [],
    decor: "",
    decorItems: [],
    outfit: "",
    outfitItems: [],
    guestList: [],
    notes: ""
  };
};
