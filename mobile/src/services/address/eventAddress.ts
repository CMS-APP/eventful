import { EventAddress } from "@/types/EventAddress";

export function normalizeEventAddress(
  address: EventAddress | string | undefined | null
): EventAddress {
  if (!address) {
    return { type: "manual", value: "" };
  }

  if (typeof address === "string") {
    return { type: "manual", value: address };
  }

  return address;
}

export function formatEventAddressDisplay(
  address: EventAddress | string | undefined | null
): string {
  const normalized = normalizeEventAddress(address);
  return normalized.type === "manual"
    ? normalized.value
    : normalized.formattedAddress;
}
