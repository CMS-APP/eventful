import PostalAddress, { addressFormats } from "i18n-postal-address";

import { labelFromNameType } from "@/features/events/addressNameTypeLabels";

import {
  CountryAddressMetadata,
  fetchCountryAddressMetadata
} from "./countryAddressMetadata";

const postalAddress = new PostalAddress({
  formats: addressFormats,
  defaultFormat: "US"
});

const VENUE_ADDRESS_FIELDS = new Set([
  "address1",
  "address2",
  "city",
  "state",
  "postalCode",
  "prefecture",
  "province",
  "region"
]);

const ADMIN_AREA_FIELDS = new Set([
  "state",
  "prefecture",
  "province",
  "region"
]);

const FIELD_KEY_TO_REQUIRE_CODE: Partial<Record<AddressFieldKey, string>> = {
  address1: "A",
  address2: "D",
  city: "C",
  state: "S",
  prefecture: "S",
  province: "S",
  region: "S",
  postalCode: "Z"
};

export type AddressFieldKey =
  | "address1"
  | "address2"
  | "city"
  | "state"
  | "postalCode"
  | "prefecture"
  | "province"
  | "region";

export interface AddressField {
  key: AddressFieldKey;
  label: string;
  required: boolean;
}

export type AddressValues = Partial<Record<AddressFieldKey, string>>;

function getFormatPartKey(part: unknown): AddressFieldKey | null {
  if (typeof part === "string") {
    return VENUE_ADDRESS_FIELDS.has(part) ? (part as AddressFieldKey) : null;
  }

  if (
    typeof part === "object" &&
    part !== null &&
    "attribute" in part &&
    typeof part.attribute === "string"
  ) {
    const key = part.attribute;
    return VENUE_ADDRESS_FIELDS.has(key) ? (key as AddressFieldKey) : null;
  }

  return null;
}

function getFieldKeysFromFormat(countryCode: string): AddressFieldKey[] {
  const format = postalAddress.getAddressFormat({ country: countryCode });
  if (!format) {
    return [];
  }

  const fieldKeys: AddressFieldKey[] = [];

  for (const row of format) {
    for (const part of row) {
      const key = getFormatPartKey(part);

      if (!key || fieldKeys.includes(key)) {
        continue;
      }

      fieldKeys.push(key);
    }
  }

  return fieldKeys;
}

function getFieldLabel(
  key: AddressFieldKey,
  metadata: CountryAddressMetadata | null
): string {
  if (key === "address1") {
    return "Address";
  }

  if (key === "address2") {
    return labelFromNameType(metadata?.sublocality_name_type, "Address line 2");
  }

  if (key === "city") {
    return labelFromNameType(metadata?.locality_name_type, "City");
  }

  if (key === "postalCode") {
    return labelFromNameType(metadata?.zip_name_type, "Postal code");
  }

  if (ADMIN_AREA_FIELDS.has(key)) {
    return labelFromNameType(metadata?.state_name_type, "State");
  }

  return key;
}

function isFieldRequired(
  key: AddressFieldKey,
  metadata: CountryAddressMetadata | null
): boolean {
  if (key === "address2") {
    return false;
  }

  const requireCode = FIELD_KEY_TO_REQUIRE_CODE[key];
  if (!requireCode || !metadata?.require) {
    return key === "address1";
  }

  return metadata.require.includes(requireCode);
}

export function buildAddressFieldsForCountry(
  countryCode: string,
  metadata: CountryAddressMetadata | null
): AddressField[] {
  if (!countryCode) {
    return [];
  }

  const fieldKeys = getFieldKeysFromFormat(countryCode);

  return fieldKeys.map((key) => ({
    key,
    label: getFieldLabel(key, metadata),
    required: isFieldRequired(key, metadata)
  }));
}

export async function getAddressFieldsForCountry(
  countryCode: string
): Promise<AddressField[]> {
  if (!countryCode) {
    return [];
  }

  const metadata = await fetchCountryAddressMetadata(countryCode);
  return buildAddressFieldsForCountry(countryCode, metadata);
}

export function formatAddress(
  countryCode: string,
  countryName: string,
  values: AddressValues
): string {
  if (!countryCode) {
    return "";
  }

  const address = new PostalAddress({
    formats: addressFormats,
    defaultFormat: countryCode
  });

  address.setFormat({ country: countryCode });

  if (values.address1) {
    address.setAddress1(values.address1);
  }
  if (values.address2) {
    address.setAddress2(values.address2);
  }
  if (values.city) {
    address.setCity(values.city);
  }
  if (values.state) {
    address.setState(values.state);
  }
  if (values.postalCode) {
    address.setPostalCode(values.postalCode);
  }
  if (values.prefecture) {
    address.setPrefecture(values.prefecture);
  }
  if (values.province) {
    address.setProvince(values.province);
  }
  if (values.region) {
    address.setRegion(values.region);
  }
  if (countryName) {
    address.setCountry(countryName);
  }

  return address.toString();
}

export function createEmptyAddressValues(
  fields: AddressField[]
): AddressValues {
  return fields.reduce<AddressValues>((values, field) => {
    values[field.key] = "";
    return values;
  }, {});
}
