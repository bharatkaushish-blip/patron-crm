const localeMap: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  AED: "ar-AE",
  SGD: "en-SG",
  AUD: "en-AU",
  JPY: "ja-JP",
  CHF: "de-CH",
};

export function formatCurrency(amount: number, currency: string): string {
  const locale = localeMap[currency] || "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number, currency: string): string {
  if (currency === "INR" && amount >= 100000) {
    return `\u20B9${(amount / 100000).toFixed(1)}L`;
  }
  return formatCurrency(amount, currency);
}
