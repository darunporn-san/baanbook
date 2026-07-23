"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export type DateInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  onValueChange?: (value: string) => void;
};

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      className,
      name,
      value,
      defaultValue,
      onChange,
      onValueChange,
      readOnly,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = React.useState(
      String(defaultValue ?? ""),
    );
    const currentValue = value === undefined ? internalValue : String(value);

    return (
      <div
        className={cn(
          "relative flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-within:ring-2 focus-within:ring-ring",
          disabled && "cursor-not-allowed opacity-50",
          readOnly && "bg-muted/50",
          className,
        )}
      >
        <span aria-hidden="true" className="truncate">
          {formatDate(currentValue) || "DD/MM/พ.ศ."}
        </span>
        <CalendarDays
          className="ml-auto h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        {!readOnly ? (
          <input
            {...props}
            ref={ref}
            type="date"
            value={currentValue}
            disabled={disabled}
            onClick={(event) => event.currentTarget.showPicker?.()}
            onChange={(event) => {
              setInternalValue(event.target.value);
              onValueChange?.(event.target.value);
              onChange?.(event);
            }}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        ) : null}
        <input type="hidden" name={name} value={currentValue} />
      </div>
    );
  },
);
DateInput.displayName = "DateInput";

export { DateInput };
