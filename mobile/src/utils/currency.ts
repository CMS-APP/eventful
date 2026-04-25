import * as RNLocalize from "react-native-localize";

export function getCurrencySymbolForDevice() {
  // Get user's device locale and region
  const locales = RNLocalize.getLocales();
  const region = locales[0]?.countryCode || "US"; // Default to 'US' if not available

  // Map country code to a default currency (ISO 4217 format)
  const regionToCurrencyMap = {
    US: "USD", // United States Dollar
    GB: "GBP", // British Pound Sterling
    EU: "EUR", // Euro
    JP: "JPY", // Japanese Yen
    IN: "INR" // Indian Rupee
    // Add more mappings as needed
  };

  const currencyCode =
    regionToCurrencyMap[region as keyof typeof regionToCurrencyMap] || "USD"; // Fallback to USD

  // Get the currency symbol using Intl
  return new Intl.NumberFormat(locales[0]?.languageTag, {
    style: "currency",
    currency: currencyCode
  })
    .format(0) // Format a dummy number
    .replace(/\d|\.|,/g, "") // Extract the symbol
    .trim();
}
