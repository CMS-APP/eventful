import { AddressValues } from "@/services/address/addressFormat";

export type EventAddress =
  | { type: "manual"; value: string }
  | {
      type: "search";
      countryCode: string;
      countryName: string;
      values: AddressValues;
      formattedAddress: string;
    };
