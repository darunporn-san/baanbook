import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BaanBook",
  description: "ระบบจัดการบ้านส่วนตัว",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
