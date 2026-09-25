export function formatCurrency(value: number): string {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0
  });
}
