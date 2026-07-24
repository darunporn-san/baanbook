import { LoaderCircle } from "lucide-react";

export function LoadingOverlay({
  label = "กำลังโหลดข้อมูล",
}: {
  label?: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div
        role="status"
        className="rounded-xl border bg-card px-8 py-6 text-center shadow-sm"
      >
        <LoaderCircle
          className="mx-auto h-7 w-7 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">กรุณารอสักครู่...</p>
      </div>
    </div>
  );
}
