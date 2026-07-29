"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Clock,
  Home,
  LayoutDashboard,
  Landmark,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Wrench,
  Menu,
  Receipt,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/homes", label: "บ้าน", icon: Home },
  { href: "/planning", label: "วางแผน", icon: Scale },
  { href: "/expenses", label: "ค่าใช้จ่าย", icon: Receipt },
  { href: "/maintenance", label: "บำรุงรักษา", icon: Wrench },
  { href: "/warranty", label: "ประกัน", icon: ShieldCheck },
  { href: "/renovations", label: "รีโนเวท", icon: Home },
  { href: "/shopping", label: "รายการซื้อ", icon: ShoppingCart },
  { href: "/mortgage", label: "สินเชื่อบ้าน", icon: Landmark },
  // { href: "/documents", label: "เอกสาร", icon: FileText },
  { href: "/timeline", label: "ไทม์ไลน์", icon: Clock },
  // { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-background"
      onSubmitCapture={(event) => event.target.closest("dialog")?.close()}
    >
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-60 -translate-x-full flex-col overflow-y-auto bg-[#246a78] px-3 py-4 text-white shadow-xl transition-[transform,width] lg:translate-x-0",
          isMobileOpen && "translate-x-0",
          isExpanded ? "lg:w-60" : "lg:w-[72px]",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex h-11 w-full items-center justify-start gap-3 px-3",
            !isExpanded && "lg:w-11 lg:justify-center lg:px-0",
          )}
          aria-label="แดชบอร์ด BaanBook"
          onClick={() => setIsMobileOpen(false)}
        >
          <Home className="h-5 w-5" />
          <span
            className={cn("text-sm font-semibold", !isExpanded && "lg:hidden")}
          >
            BaanBook
          </span>
        </Link>
        <button
          type="button"
          className="absolute right-4 top-5 flex h-9 w-9 items-center justify-center rounded-sm text-white/80 hover:bg-white/15 hover:text-white lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="ปิดเมนู"
        >
          <X className="h-5 w-5" />
        </button>
        <nav className="mt-6 flex flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded((value) => !value)}
            className={cn(
              "hidden h-10 items-center rounded-sm text-white/80 hover:bg-white/15 hover:text-white lg:flex",
              isExpanded
                ? "w-full justify-start gap-3 px-3"
                : "w-10 justify-center self-center",
            )}
            aria-label={isExpanded ? "ย่อเมนู" : "ขยายเมนู"}
            aria-expanded={isExpanded}
          >
            <Menu className="h-5 w-5" />
            <span
              className={cn("text-sm font-medium", !isExpanded && "lg:hidden")}
            >
              เมนู
            </span>
          </button>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 w-full items-center justify-start gap-3 rounded-sm px-3 text-white/80 hover:bg-white/15 hover:text-white",
                  isActive && "bg-white/15 text-white",
                  !isExpanded &&
                    "lg:w-10 lg:justify-center lg:self-center lg:px-0",
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive && "font-bold",
                    !isExpanded && "lg:hidden",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        {/* <div className="flex flex-col gap-2">
          <button
            className={cn(
              "flex h-10 w-full items-center justify-start gap-3 rounded-sm px-3 text-white/70",
              !isExpanded && "md:w-10 md:justify-center md:self-center md:px-0",
            )}
            aria-label="ดาวน์โหลด"
          >
            <Download className="h-5 w-5" />
            <span
              className={cn("text-sm font-medium", !isExpanded && "md:hidden")}
            >
              ดาวน์โหลด
            </span>
          </button>
          <button
            className={cn(
              "flex h-10 w-full items-center justify-start gap-3 rounded-sm px-3 text-white/70",
              !isExpanded && "md:w-10 md:justify-center md:self-center md:px-0",
            )}
            aria-label="ออกจากระบบ"
          >
            <Power className="h-5 w-5" />
            <span
              className={cn("text-sm font-medium", !isExpanded && "md:hidden")}
            >
              ออก
            </span>
          </button>
        </div> */}
      </aside>
      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="ปิดเมนู"
        />
      ) : null}
      <div
        className={cn(
          "transition-[padding] lg:pl-[72px]",
          isExpanded && "lg:pl-60",
        )}
      >
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-4 lg:justify-end lg:px-6">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-sm text-primary hover:bg-secondary lg:hidden"
            onClick={() => setIsMobileOpen(true)}
            aria-label="เปิดเมนู"
            aria-expanded={isMobileOpen}
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* <p className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            เฟส 1
          </p> */}
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
