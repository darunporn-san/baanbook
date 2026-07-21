export const expenseCategoryGroups = [
  {
    label: "สาธารณูปโภค",
    items: [
      { value: "utilities", label: "สาธารณูปโภคทั่วไป" },
      { value: "electricity", label: "ค่าไฟ" },
      { value: "water", label: "ค่าน้ำ" },
      { value: "internet", label: "ค่าอินเทอร์เน็ต" },
      { value: "gas", label: "ค่าแก๊ส" },
      { value: "phone", label: "ค่าโทรศัพท์" },
      { value: "waste", label: "ค่าจัดเก็บขยะ" },
      { value: "security", label: "ค่ารักษาความปลอดภัย" },
    ],
  },
  {
    label: "ดูแลบ้าน",
    items: [
      { value: "maintenance", label: "บำรุงรักษา" },
      { value: "repair", label: "ซ่อมแซม" },
      { value: "cleaning", label: "ทำความสะอาด" },
      { value: "pest_control", label: "กำจัดปลวก/แมลง" },
      { value: "garden", label: "สวน" },
    ],
  },
  {
    label: "ปรับปรุงบ้าน",
    items: [
      { value: "appliance", label: "เครื่องใช้ไฟฟ้า" },
      { value: "renovation", label: "รีโนเวท" },
      { value: "survey", label: "ค่าสำรวจ" },
      { value: "inspection", label: "ค่าตรวจสอบ" },
      { value: "installation", label: "ค่าติดตั้ง" },
      { value: "labor", label: "ค่าแรง" },
      { value: "demolition", label: "ค่ารื้อถอน" },
      { value: "furniture", label: "เฟอร์นิเจอร์" },
    ],
  },
  {
    label: "ของใช้และอุปกรณ์",
    items: [
      { value: "household_supply", label: "ของใช้ในบ้าน" },
      { value: "kitchen_supply", label: "ของใช้และอุปกรณ์ครัว" },
      { value: "bathroom_supply", label: "ของใช้และอุปกรณ์ห้องน้ำ" },
      { value: "cleaning_supply", label: "อุปกรณ์ทำความสะอาด" },
      { value: "tools", label: "เครื่องมือช่าง" },
      { value: "building_material", label: "วัสดุซ่อมแซม/ก่อสร้าง" },
      { value: "decoration", label: "ของตกแต่งบ้าน" },
    ],
  },
  {
    label: "การถือครอง",
    items: [
      { value: "mortgage", label: "ผ่อนบ้าน" },
      { value: "common_fee", label: "ค่าส่วนกลาง" },
      { value: "property_tax", label: "ภาษีที่ดิน/สิ่งปลูกสร้าง" },
      { value: "insurance", label: "ประกันภัย" },
      { value: "other", label: "อื่น ๆ" },
    ],
  },
] as const;

export function getExpenseCategoryLabel(value: string) {
  for (const group of expenseCategoryGroups) {
    const item = group.items.find((category) => category.value === value);
    if (item) return item.label;
  }

  return value;
}
