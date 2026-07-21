import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-xl bg-[#246a78] p-5 text-white shadow-sm sm:p-6">
        <p className="text-sm font-medium text-white/70">การตั้งค่าระบบ</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">ตั้งค่า</h1>
        <p className="mt-2 text-sm text-white/80">
          ตั้งค่าบัญชีและการใช้งานบ้านจะอยู่ในหน้านี้
        </p>
      </section>
      <Card className="max-w-3xl border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">เฟส 0</CardTitle>
          <CardDescription>
            โครงสร้างพื้นฐานของบ้านใช้งานได้โดยยังไม่เปิดระบบยืนยันตัวตน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ระบบล็อกอิน การทำงานร่วมกัน การแจ้งเตือน และการส่งออกข้อมูล
            จะทำในเฟสถัดไป
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
