export function formatMoney(amountMinor: number, currency = "THB") {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";

  const [date] = value.split("T");
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

export function formatDimension(value: number | null | undefined) {
  if (value == null) return null;

  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(value);
}
