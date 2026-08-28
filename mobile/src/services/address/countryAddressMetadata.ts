const ADDRESS_DATA_BASE_URL =
  "https://chromium-i18n.appspot.com/ssl-address/data";

export interface CountryAddressMetadata {
  fmt: string;
  require: string;
  zip_name_type?: string;
  state_name_type?: string;
  locality_name_type?: string;
  sublocality_name_type?: string;
}

export async function fetchCountryAddressMetadata(
  countryCode: string
): Promise<CountryAddressMetadata | null> {
  const normalizedCode = countryCode.toUpperCase();

  try {
    const response = await fetch(
      `${ADDRESS_DATA_BASE_URL}/${normalizedCode}`
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as CountryAddressMetadata;

    if (!data.fmt) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
