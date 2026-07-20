# Coding Standard

เอกสารนี้กำหนดมาตรฐานการเขียนโค้ดสำหรับ BaanBook เมื่อเริ่ม implementation จริง

## Core Principles

- TypeScript ต้อง strict
- โค้ดต้องอ่านง่ายกว่าฉลาด
- ใช้ pattern เดิมของโปรเจกต์ก่อนสร้าง pattern ใหม่
- Validate input ที่ server boundary เสมอ
- Phase 0 ยังไม่มี authentication หรือ RLS
- หลีกเลี่ยง dependency ที่ยังไม่มีความจำเป็นจริง
- แยก domain logic ออกจาก UI เมื่อ logic เริ่มซับซ้อน

## TypeScript

### Rules

- หลีกเลี่ยง `any`
- ใช้ `unknown` เมื่อ input ไม่แน่นอน แล้ว narrow ก่อนใช้
- ตั้งชื่อ type ตาม domain เช่น `ExpenseSummary`, `MaintenanceStatus`
- ใช้ union type สำหรับ status ที่จำกัดค่า
- Function public ใน feature module ควรมี return type ชัดเจน

### Example Direction

```ts
type MaintenanceStatus =
  | "todo"
  | "scheduled"
  | "in_progress"
  | "done"
  | "skipped"
  | "cancelled";
```

## Next.js

### App Router

- ใช้ App Router
- ใช้ Server Components เป็น default
- เพิ่ม `"use client"` เฉพาะ component ที่ต้อง interactive
- Data-heavy page ควร fetch บน server
- Mutation ใช้ Server Actions หรือ Route Handlers ตามความเหมาะสม

### Routing

แนว route ที่แนะนำ:

```text
/dashboard
/homes
/homes/[homeId]
/expenses
/renovations
/appliances
/documents
/maintenance
/warranties
/timeline
/shopping
/mortgage
/settings
```

ถ้าระบบ multi-home ชัดเจนขึ้น อาจเปลี่ยนเป็น:

```text
/homes/[homeId]/dashboard
/homes/[homeId]/expenses
```

ควรเลือก route strategy ก่อนเริ่ม implementation เพื่อไม่ย้าย path บ่อย

## Component Standard

### Component Types

- Page component: จัด layout และ data fetching
- Feature component: UI เฉพาะ domain
- Shared component: ใช้ข้าม feature จริง ๆ เท่านั้น
- UI primitive: มาจาก shadcn/ui

### Naming

- Component ใช้ PascalCase
- Hook ใช้ `useSomething`
- Server action ใช้ verb เช่น `createExpense`, `updateMaintenanceTask`
- Query function ใช้ `get`, `list`, `search`

### Props

- Props type อยู่ใกล้ component
- อย่าส่ง object ใหญ่เกินจำเป็น
- Callback name ใช้ `onSubmit`, `onChange`, `onClose`

## Tailwind CSS

### Rules

- ใช้ utility class ตาม shadcn/ui convention
- หลีกเลี่ยง arbitrary value หาก token หรือ spacing scale ใช้ได้
- ไม่ใช้ inline style ยกเว้นมีเหตุผลชัดเจน
- อย่า duplicate class ยาวซ้ำ ๆ หลายที่ ให้ดึงเป็น component เมื่อซ้ำจริง

### Responsive

- Mobile-first
- ใช้ breakpoint อย่างตั้งใจ
- ตรวจ text overflow ในปุ่ม badge และ table cell

## shadcn/ui

### Usage

- ใช้ shadcn/ui เป็น base component
- ปรับผ่าน className และ design tokens
- ไม่แก้ component primitive แบบทำลาย compatibility โดยไม่จำเป็น
- Icon ใช้ lucide-react

### Expected Components

- Button
- Input
- Textarea
- Select
- Checkbox
- Dialog
- Sheet
- DropdownMenu
- Tabs
- Table
- Badge
- Card
- Tooltip
- Calendar
- Popover
- Form

## Supabase

### Client Usage

- Browser client ใช้เฉพาะฝั่ง client
- Server client ใช้ใน Server Components, Server Actions และ Route Handlers
- ห้าม expose service role key ไป browser
- Query ต้องอยู่ใน feature query/action layer

### Database Types

- Generate types จาก Supabase schema
- อย่าเขียน database row type เองถ้า generated type มีอยู่แล้ว
- สร้าง domain type เพิ่มเมื่อ UI ต้องการ shape ที่ต่างจาก row

### RLS

Phase 0 ยังไม่ใช้ RLS เพราะ auth ถูกตัดออกแล้ว

เมื่อเพิ่ม authentication กลับมา:

- ทุก table ที่มี user data ต้องเปิด RLS
- Policy ต้องทดสอบ role อย่างน้อย owner, editor, viewer และ non-member
- Application code ห้าม assume ว่า UI ซ่อนปุ่มแล้วปลอดภัย

## Forms and Validation

### Rules

- Client validation เพื่อ UX
- Server validation เพื่อ correctness
- Database constraint เพื่อ integrity
- Amount และ date ต้อง validate เสมอ
- File upload ต้อง validate type และ size

### Error Handling

- Return field errors เมื่อเป็น form
- Return generic message เมื่อเป็น unexpected server error
- Log server context โดยไม่ log sensitive document content

## Money

เงินต้องเก็บเป็น integer minor unit

Examples:

- 100.50 THB เก็บเป็น 10050 satang
- Display format ทำที่ presentation layer
- Calculation หลีกเลี่ยง floating point

## Date and Time

- เก็บ timestamp เป็น UTC
- Date-only field เช่น expense_date หรือ warranty end date ใช้ date
- แสดงผลตาม timezone ของ home หรือ user
- Recurring rule ต้องระวัง timezone และ daylight saving แม้ผู้ใช้หลักอยู่ไทย

## File Upload

### Rules

- Upload ไป private bucket
- Metadata บันทึกใน database
- Storage path ต้องมี home_id
- Download ใช้ signed URL
- จำกัด file size
- จำกัด mime type

### Allowed File Types รอบแรก

- PDF
- JPG
- PNG
- WEBP

## Testing Strategy

### MVP Minimum

- Unit test สำหรับ pure utility เช่น money/date formatting
- Integration test สำหรับ server action สำคัญ
- Smoke test สำหรับ dashboard และ home creation

### Manual QA Checklist

- User A เห็นเฉพาะบ้านตัวเอง
- User B เข้า URL บ้านของ User A ไม่ได้
- Viewer แก้ข้อมูลไม่ได้
- Upload เอกสารแล้วเปิด preview ได้
- Delete/archive ไม่ทำให้ dashboard พัง

## Performance

- Paginate list ที่อาจยาว
- Filter ด้วย home_id ทุก query
- Index field ที่ใช้ filter/sort
- หลีกเลี่ยง N+1 query ใน dashboard
- ใช้ server-side aggregation เมื่อเหมาะสม

## Security

- Validate ทุก mutation
- Sanitize user-facing text เมื่อ render rich content
- อย่าเก็บ secret ใน repository
- อย่า log token หรือ signed URL
- ตรวจ permission ก่อนสร้าง signed URL
- เมื่อ auth กลับมา RLS ต้องครอบคลุม document metadata และ storage access

## Git and Review

- Commit ควรเล็กและอธิบาย intent
- PR ต้องมี summary และ test evidence
- Migration ต้อง review แยกละเอียด
- การเปลี่ยน RLS ต้องถือเป็น high-risk change

## Definition of Done

งานหนึ่งชิ้นถือว่าเสร็จเมื่อ:

- ทำงานตาม acceptance criteria
- TypeScript ผ่าน
- Lint ผ่าน
- Test ที่เกี่ยวข้องผ่าน
- Empty/loading/error state ครบสำหรับ UI ที่แตะ
- Permission ไม่รั่ว
- ไม่มี console log ที่ไม่จำเป็น
- เอกสารอัปเดตหากเปลี่ยน architecture หรือ behavior สำคัญ
