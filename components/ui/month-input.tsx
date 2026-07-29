"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return "";

  return new Intl.DateTimeFormat("th-TH", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1)));
}

export function MonthInput({
  id,
  name,
  defaultValue,
  placeholder = "เลือกเดือน",
  className,
}: {
  id?: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = React.useState(defaultValue ?? "");

  return (
    <div
      className={cn(
        "relative flex h-10 w-full items-center rounded-md border border-input bg-background px-3 text-sm focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <span className="truncate">{formatMonth(value) || placeholder}</span>
      <CalendarDays
        className="ml-auto h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id={id}
        type="month"
        value={value}
        onClick={(event) => event.currentTarget.showPicker?.()}
        onChange={(event) => setValue(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={placeholder}
      />
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
