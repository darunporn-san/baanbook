import { LoaderCircle } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div
        role="status"
        className="rounded-xl border bg-card px-8 py-6 text-center shadow-sm"
      >
        <LoaderCircle
          className="mx-auto h-7 w-7 animate-spin text-primary"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-semibold">กำลังโหลดข้อมูล</p>
        <p className="mt-1 text-xs text-muted-foreground">กรุณารอสักครู่...</p>
      </div>
    </div>
  );
}
