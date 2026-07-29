"use client";

import { useState } from "react";
import type { PriceBasis } from "@/features/planning/pricing";

const fieldClass =
  "h-10 w-full rounded-md border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function InstallationFields({
  defaultHasInstallation = true,
  defaultPriceBasis = "total",
  defaultPriceMinor = 0,
}: {
  defaultHasInstallation?: boolean;
  defaultPriceBasis?: PriceBasis;
  defaultPriceMinor?: number;
}) {
  const [hasInstallation, setHasInstallation] = useState(
    defaultHasInstallation,
  );

  return (
    <>
      <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        มีค่าติดตั้งไหม
        <select
          name="has_installation"
          value={String(hasInstallation)}
          onChange={(event) =>
            setHasInstallation(event.target.value === "true")
          }
          className={fieldClass}
        >
          <option value="true">มีค่าติดตั้ง</option>
          <option value="false">ไม่มีค่าติดตั้ง</option>
        </select>
      </label>
      {hasInstallation ? (
        <>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            รูปแบบค่าติดตั้ง
            <select
              name="installation_price_basis"
              defaultValue={defaultPriceBasis}
              className={fieldClass}
            >
              <option value="per_unit">แยกต่อชิ้น</option>
              <option value="total">รวมทั้งหมด</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            ค่าติดตั้ง
            <input
              name="installation_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={defaultPriceMinor / 100}
              className={fieldClass}
            />
          </label>
        </>
      ) : null}
    </>
  );
}
