import { PlaceAddressComponent } from "@/services/firebase/firebaseBackend";

import { AddressField, AddressFieldKey, AddressValues } from "./addressFormat";

export interface RawPlaceAddress {
  countryCode: string | null;
  address1: string;
  address2: string;
  city: string;
  adminArea1: string;
  postalCode: string;
}

const ADMIN_AREA_KEYS: AddressFieldKey[] = [
  "state",
  "prefecture",
  "province",
  "region"
];

function findComponent(
  components: PlaceAddressComponent[],
  type: string
): PlaceAddressComponent | undefined {
  return components.find((component) => component.types.includes(type));
}

export function extractRawPlaceAddress(
  components: PlaceAddressComponent[],
  formattedAddress: string | null
): RawPlaceAddress {
  const countryCode =
    findComponent(components, "country")?.shortText?.toUpperCase() ?? null;

  const streetNumber = findComponent(components, "street_number")?.longText ?? "";
  const route = findComponent(components, "route")?.longText ?? "";
  const premise = findComponent(components, "premise")?.longText ?? "";

  let address1 = [streetNumber, route].filter(Boolean).join(" ").trim();
  if (!address1) {
    address1 = premise || formattedAddress?.split(",")[0]?.trim() || "";
  }

  const address2 = findComponent(components, "subpremise")?.longText ?? "";

  const city =
    findComponent(components, "locality")?.longText ??
    findComponent(components, "postal_town")?.longText ??
    findComponent(components, "sublocality")?.longText ??
    findComponent(components, "sublocality_level_1")?.longText ??
    findComponent(components, "administrative_area_level_2")?.longText ??
    "";

  const adminArea1 =
    findComponent(components, "administrative_area_level_1")?.longText ?? "";

  const postalCode = findComponent(components, "postal_code")?.longText ?? "";
  const postalCodeSuffix =
    findComponent(components, "postal_code_suffix")?.longText ?? "";

  return {
    countryCode,
    address1,
    address2,
    city,
    adminArea1,
    postalCode: postalCodeSuffix ? `${postalCode}-${postalCodeSuffix}` : postalCode
  };
}

export function mapRawPlaceAddressToFields(
  raw: RawPlaceAddress,
  fields: AddressField[]
): AddressValues {
  const availableKeys = new Set(fields.map((field) => field.key));
  const values: AddressValues = {};

  if (availableKeys.has("address1") && raw.address1) {
    values.address1 = raw.address1;
  }
  if (availableKeys.has("address2") && raw.address2) {
    values.address2 = raw.address2;
  }
  if (availableKeys.has("city") && raw.city) {
    values.city = raw.city;
  }
  if (availableKeys.has("postalCode") && raw.postalCode) {
    values.postalCode = raw.postalCode;
  }

  const adminAreaKey = ADMIN_AREA_KEYS.find((key) => availableKeys.has(key));
  if (adminAreaKey && raw.adminArea1) {
    values[adminAreaKey] = raw.adminArea1;
  }

  return values;
}
