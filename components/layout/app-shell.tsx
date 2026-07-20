"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Clock,
  Download,
  FileText,
  Home,
  LayoutDashboard,
  Landmark,
  ShieldCheck,
  ShoppingCart,
  Wrench,
  Menu,
  Power,
  Receipt,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { href: "/homes", label: "บ้าน", icon: Home },
  { href: "/expenses", label: "ค่าใช้จ่าย", icon: Receipt },
  { href: "/maintenance", label: "บำรุงรักษา", icon: Wrench },
  { href: "/warranty", label: "ประกัน", icon: ShieldCheck },
  { href: "/renovations", label: "รีโนเวท", icon: Home },
  { href: "/shopping", label: "รายการซื้อ", icon: ShoppingCart },
  { href: "/mortgage", label: "สินเชื่อบ้าน", icon: Landmark },
  { href: "/documents", label: "เอกสาร", icon: FileText },
  { href: "/timeline", label: "ไทม์ไลน์", icon: Clock },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 hidden bg-[#246a78] px-3 py-4 text-white shadow-xl transition-[width] md:flex md:flex-col",
          isOpen ? "w-60" : "w-[72px]",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex h-11 items-center rounded-sm border border-white/25 bg-white/15",
            isOpen ? "w-full justify-start gap-3 px-3" : "w-11 justify-center",
          )}
          aria-label="แดชบอร์ด BaanBook"
        >
          <Home className="h-5 w-5" />
          {isOpen ? <span className="text-sm font-semibold">BaanBook</span> : null}
        </Link>
        <nav className="mt-6 flex flex-1 flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className={cn(
              "flex h-10 items-center rounded-sm text-white/80 hover:bg-white/15 hover:text-white",
              isOpen ? "w-full justify-start gap-3 px-3" : "w-10 justify-center self-center",
            )}
            aria-label={isOpen ? "ย่อเมนู" : "ขยายเมนู"}
            aria-expanded={isOpen}
          >
            <Menu className="h-5 w-5" />
            {isOpen ? <span className="text-sm font-medium">เมนู</span> : null}
          </button>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center rounded-sm text-white/80 hover:bg-white/15 hover:text-white",
                isOpen ? "w-full justify-start gap-3 px-3" : "w-10 justify-center self-center",
              )}
              aria-label={item.label}
            >
              <item.icon className="h-5 w-5" />
              {isOpen ? <span className="text-sm font-medium">{item.label}</span> : null}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2">
          <button
            className={cn(
              "flex h-10 items-center rounded-sm text-white/70",
              isOpen ? "w-full justify-start gap-3 px-3" : "w-10 justify-center self-center",
            )}
            aria-label="ดาวน์โหลด"
          >
            <Download className="h-5 w-5" />
            {isOpen ? <span className="text-sm font-medium">ดาวน์โหลด</span> : null}
          </button>
          <button
            className={cn(
              "flex h-10 items-center rounded-sm text-white/70",
              isOpen ? "w-full justify-start gap-3 px-3" : "w-10 justify-center self-center",
            )}
            aria-label="ออกจากระบบ"
          >
            <Power className="h-5 w-5" />
            {isOpen ? <span className="text-sm font-medium">ออก</span> : null}
          </button>
        </div>
      </aside>
      <div className={cn("transition-[padding] md:pl-[72px]", isOpen && "md:pl-60")}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end border-b bg-background/95 px-4 md:px-6">
          <p className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">เฟส 1</p>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
