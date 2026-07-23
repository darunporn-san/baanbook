"use client";

import { useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditDialog({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => dialogRef.current?.showModal()}
      >
        แก้ไข
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-xl overflow-hidden rounded-2xl border border-white/70 bg-white p-0 text-foreground shadow-2xl backdrop:bg-slate-950/35 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4 sm:p-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="ปิดหน้าต่างแก้ไข"
            onClick={() => dialogRef.current?.close()}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[calc(100dvh-7rem)] overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </dialog>
    </>
  );
}
