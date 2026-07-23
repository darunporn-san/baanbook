"use client";

import { useRef, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type MobileCreateDialogProps = {
  title: string;
  description?: string;
  triggerLabel?: string;
  children: ReactNode;
};

export function MobileCreateDialog({
  title,
  description,
  triggerLabel = title,
  children,
}: MobileCreateDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="absolute right-4 top-4 z-10 lg:hidden">
      <Button
        type="button"
        variant="secondary"
        className="h-9 rounded-full bg-white/95 px-3 text-foreground shadow-md hover:bg-white"
        onClick={() => dialogRef.current?.showModal()}
      >
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </Button>
      <dialog
        ref={dialogRef}
        className="mx-auto mb-3 mt-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl border border-white/70 bg-white p-0 text-foreground shadow-2xl backdrop:bg-slate-950/35 backdrop:backdrop-blur-sm sm:m-auto"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-4">
          <div>
            <h2 className="font-semibold">{title}</h2>
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
            aria-label="ปิด"
            onClick={() => dialogRef.current?.close()}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[calc(100dvh-7rem)] overflow-y-auto bg-white p-4">
          {children}
        </div>
      </dialog>
    </div>
  );
}

export function MobileCreateTrigger({
  dialogId,
  label,
}: {
  dialogId: string;
  label: string;
}) {
  return (
    <div className="absolute right-4 top-4 z-10 lg:hidden">
      <Button
        type="button"
        variant="secondary"
        className="h-9 rounded-full bg-white/95 px-3 text-foreground shadow-md hover:bg-white"
        onClick={() =>
          (
            document.getElementById(dialogId) as HTMLDialogElement | null
          )?.showModal()
        }
      >
        <Plus className="h-4 w-4" />
        {label}
      </Button>
    </div>
  );
}

export function ResponsiveCreatePanel({
  dialogId,
  title,
  children,
}: {
  dialogId: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <dialog
        id={dialogId}
        className="mx-auto mb-3 mt-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl border border-white/70 bg-white p-0 text-foreground shadow-2xl backdrop:bg-slate-950/35 backdrop:backdrop-blur-sm sm:m-auto lg:hidden"
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-white p-3">
          <h2 className="font-semibold">{title}</h2>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="ปิด"
            onClick={(event) => event.currentTarget.closest("dialog")?.close()}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto bg-white p-3">
          {children}
        </div>
      </dialog>
      <div className="hidden lg:block">{children}</div>
    </>
  );
}
