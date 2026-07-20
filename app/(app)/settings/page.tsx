import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">ตั้งค่า</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ตั้งค่าบัญชีและการใช้งานบ้านจะอยู่ในหน้านี้
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">เฟส 0</CardTitle>
          <CardDescription>โครงสร้างพื้นฐานของบ้านใช้งานได้โดยยังไม่เปิดระบบยืนยันตัวตน</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ระบบล็อกอิน การทำงานร่วมกัน การแจ้งเตือน และการส่งออกข้อมูล จะทำในเฟสถัดไป
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
