export const commonText = {
  save: "บันทึก",
  cancel: "ยกเลิก",
  edit: "แก้ไข",
  delete: "ลบ",
  view: "ดูข้อมูล",
  noRoom: "ไม่ระบุห้อง",
  noAppliance: "ไม่ระบุเครื่องใช้ไฟฟ้า",
  noProject: "ไม่ระบุโปรเจกต์",
  noDetails: "ยังไม่มีรายละเอียด",
  noFile: "ไม่มีไฟล์",
};

export const homeTypeLabels: Record<string, string> = {
  house: "บ้านเดี่ยว",
  condo: "คอนโด",
  townhouse: "ทาวน์เฮาส์",
  other: "อื่น ๆ",
};

export const documentTypeLabels: Record<string, string> = {
  receipt: "ใบเสร็จ",
  warranty: "ประกัน",
  manual: "คู่มือ",
  contract: "สัญญา",
  other: "อื่น ๆ",
};

export const maintenanceStatusLabels: Record<string, string> = {
  todo: "ต้องทำ",
  scheduled: "วางแผนแล้ว",
  in_progress: "กำลังทำ",
  done: "เสร็จแล้ว",
  skipped: "ข้าม",
  cancelled: "ยกเลิก",
};

export const priorityLabels: Record<string, string> = {
  low: "ต่ำ",
  medium: "ปานกลาง",
  high: "สูง",
  urgent: "ด่วน",
};

export const renovationStatusLabels: Record<string, string> = {
  planning: "วางแผน",
  active: "กำลังทำ",
  paused: "พักไว้",
  completed: "เสร็จแล้ว",
  cancelled: "ยกเลิก",
};

export const shoppingStatusLabels: Record<string, string> = {
  planned: "วางแผนซื้อ",
  bought: "ซื้อแล้ว",
  cancelled: "ยกเลิก",
};

export const openingTypeLabels: Record<string, string> = {
  window: "หน้าต่าง",
  door: "ประตู",
  balcony: "ระเบียง",
  other: "อื่น ๆ",
};

export const timelineEventLabels: Record<string, string> = {
  manual: "บันทึกเอง",
  purchase: "วันที่ซื้อ",
  appointment: "นัดหมาย",
  warranty_end: "หมดประกัน",
  maintenance_due: "กำหนดซ่อม",
  room_added: "เพิ่มห้อง",
  expense_added: "เพิ่มค่าใช้จ่าย",
  appliance_added: "เพิ่มเครื่องใช้ไฟฟ้า",
  document_added: "เพิ่มเอกสาร",
  maintenance_added: "เพิ่มงานบำรุงรักษา",
  maintenance_completed: "งานบำรุงรักษาเสร็จแล้ว",
  renovation_added: "เพิ่มโปรเจกต์รีโนเวท",
  shopping_added: "เพิ่มรายการซื้อ",
};

export function formatTimelineTitle(title: string) {
  return title
    .replace(/^Room added: /, "เพิ่มห้อง: ")
    .replace(/^Expense added: /, "เพิ่มค่าใช้จ่าย: ")
    .replace(/^Appliance added: /, "เพิ่มเครื่องใช้ไฟฟ้า: ")
    .replace(/^Document added: /, "เพิ่มเอกสาร: ")
    .replace(/^Maintenance added: /, "เพิ่มงานบำรุงรักษา: ")
    .replace(/^Maintenance completed: /, "งานบำรุงรักษาเสร็จแล้ว: ")
    .replace(/^Renovation added: /, "เพิ่มโปรเจกต์รีโนเวท: ")
    .replace(/^Shopping item added: /, "เพิ่มรายการซื้อ: ")
    .replace(/^Mortgage added: /, "เพิ่มสินเชื่อบ้าน: ");
}

export function getLabel(
  labels: Record<string, string>,
  value: string | null | undefined,
) {
  if (!value) return "";
  return labels[value] ?? value;
}
