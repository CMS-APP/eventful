export const ADDRESS_NAME_TYPE_LABELS: Record<string, string> = {
  area: "Area",
  city: "City",
  county: "County",
  department: "Department",
  district: "District",
  do_si: "Province",
  eircode: "Eircode",
  emirate: "Emirate",
  island: "Island",
  neighborhood: "Neighborhood",
  oblast: "Oblast",
  parish: "Parish",
  pin: "PIN code",
  post_town: "Town/City",
  postal: "Postcode",
  prefecture: "Prefecture",
  province: "Province",
  state: "State",
  suburb: "Suburb",
  townland: "Townland",
  village_township: "Village/Township",
  zip: "ZIP code"
};

export function labelFromNameType(
  nameType: string | undefined,
  fallback: string
): string {
  if (!nameType) {
    return fallback;
  }

  return (
    ADDRESS_NAME_TYPE_LABELS[nameType] ??
    nameType.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
}
