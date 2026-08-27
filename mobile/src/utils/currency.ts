import * as RNLocalize from "react-native-localize";

export function getCurrencySymbolForDevice() {
  const locales = RNLocalize.getLocales();
  const region = locales[0]?.countryCode || "US";

  const regionToCurrencyMap = {
    US: "USD",
    GB: "GBP",
    EU: "EUR",
    JP: "JPY",
    IN: "INR"
  };

  const currencyCode =
    regionToCurrencyMap[region as keyof typeof regionToCurrencyMap] || "USD";

  return new Intl.NumberFormat(locales[0]?.languageTag, {
    style: "currency",
    currency: currencyCode
  })
    .format(0)
    .replace(/\d|\.|,/g, "")
    .trim();
}
