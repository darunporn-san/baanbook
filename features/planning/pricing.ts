export type PriceBasis = "per_unit" | "total";

export function priceTotal(
  priceMinor: number,
  quantity: number,
  basis: PriceBasis,
) {
  return basis === "per_unit" ? priceMinor * quantity : priceMinor;
}
