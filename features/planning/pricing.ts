export type PriceBasis = "per_unit" | "total";

export function priceTotal(
  priceMinor: number,
  quantity: number,
  basis: PriceBasis,
) {
  return basis === "per_unit" ? priceMinor * quantity : priceMinor;
}

export function installationTotal(
  hasInstallation: boolean,
  priceMinor: number,
  quantity: number,
  basis: PriceBasis,
) {
  return hasInstallation ? priceTotal(priceMinor, quantity, basis) : 0;
}
