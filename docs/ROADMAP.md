# Roadmap

Roadmap นี้แบ่งเป็นเฟสเพื่อให้ BaanBook เริ่มใช้งานได้เร็ว แต่ยังมีทางขยายไปเป็นระบบจัดการบ้านเต็มรูปแบบ

## Phase 0: Foundation

เป้าหมายคือสร้างฐานระบบที่มั่นคงก่อนเริ่มฟีเจอร์ใหญ่

### Deliverables

- Project setup ด้วย Next.js, TypeScript และ Tailwind
- shadcn/ui foundation
- Supabase project connection
- App shell, sidebar, top navigation
- Database migration workflow
- Environment variable convention
- Error, loading และ empty state pattern
- No-auth private foundation สำหรับช่วงเริ่มต้น

### Acceptance Criteria

- ผู้ใช้สร้าง home แรกได้
- มี layout หลักสำหรับ dashboard และ feature pages
- `/dashboard` เปิดได้ทันทีโดยไม่ผ่าน login
- Supabase healthcheck เห็น `homes` และ `rooms`

## Phase 1: MVP Home Record

เป้าหมายคือให้ผู้ใช้เริ่มเก็บข้อมูลบ้านที่สำคัญที่สุดได้

### Features

- Home profile
- Room management
- Expense tracking
- Appliance inventory
- Document upload
- Basic dashboard
- Basic timeline

### Acceptance Criteria

- ผู้ใช้บันทึกบ้าน ห้อง ค่าใช้จ่าย เครื่องใช้ และเอกสารได้
- ค่าใช้จ่ายแสดงตามเดือนและหมวดหมู่ได้
- เครื่องใช้เก็บ purchase date, price, warranty end date ได้
- เอกสาร upload ไป Supabase Storage และผูกกับบ้านได้
- Timeline แสดง event จาก activity สำคัญได้

## Phase 2: Maintenance and Warranty

เป้าหมายคือทำให้ระบบช่วยเตือนและดูแลบ้านเชิงปฏิบัติ

### Features

- Maintenance task
- Warranty tracking
- Status board สำหรับงานค้าง
- Link maintenance กับ appliance หรือ room
- Room dimensions: width, length, height

Future scope หลัง Phase 2:

- Recurring maintenance generator
- Reminder rules และ notification จริง
- Warranty claim workflow
- Calendar view
- Room openings CRUD สำหรับ window, door, balcony
- Link maintenance กับ renovation

### Acceptance Criteria

- ผู้ใช้สร้าง maintenance task พร้อม due date ได้
- ระบบแสดง task ที่ overdue, upcoming และ completed ได้
- Warranty ใกล้หมดถูกแสดงใน dashboard
- Maintenance history ถูกบันทึกเป็น timeline event
- Room เก็บ width, length, height ได้

### Implementation Status

ดูสถานะ implementation ปัจจุบันที่ [PHASE2_STATUS.md](./PHASE2_STATUS.md)

## Phase 3: Renovation and Shopping

เป้าหมายคือรองรับการวางแผนและติดตามงานปรับปรุงบ้าน

### Features

- Renovation project
- Renovation budget
- Contractor/vendor information
- Shopping list
- Wishlist
- Quote comparison
- Link expense กับ renovation project
- Room openings measurement สำหรับหน้าต่าง ประตู และงาน built-in

### Acceptance Criteria

- ผู้ใช้สร้าง renovation project พร้อม budget และ status ได้
- ค่าใช้จ่ายสามารถผูกกับ project ได้
- Shopping item มีสถานะ planned, bought, cancelled ได้
- Dashboard แสดง budget used และ remaining ได้

### Implementation Status

ดูสถานะ implementation ปัจจุบันที่ [PHASE3_STATUS.md](./PHASE3_STATUS.md)

## Phase 4: Mortgage

เป้าหมายคือให้ผู้ใช้เห็นภาพรวมหนี้บ้านและ payment history

### Features

- Mortgage profile
- Loan terms
- Payment schedule
- Payment history
- Interest/principal breakdown แบบพื้นฐาน
- Dashboard mortgage summary

### Acceptance Criteria

- ผู้ใช้บันทึกวงเงินกู้ อัตราดอกเบี้ย ระยะเวลา และวันเริ่มสัญญาได้
- ผู้ใช้บันทึก payment แต่ละเดือนได้
- ระบบแสดง outstanding balance โดยอิงข้อมูลที่ผู้ใช้กรอก
- ไม่มีการอ้างว่าเป็น financial advice

### Implementation Status

ดูสถานะ implementation ปัจจุบันที่ [PHASE4_STATUS.md](./PHASE4_STATUS.md)

## Phase 5: Intelligence and Automation

เป้าหมายคือเพิ่มความสะดวกหลังจาก core data มีคุณภาพ

### Candidate Features

- OCR ใบเสร็จและเอกสาร
- Smart categorization
- Natural language search
- Automated reminders
- Email/file import
- Export to CSV/PDF
- Insight เช่น ค่าใช้จ่ายหมวดไหนสูงผิดปกติ

### Acceptance Criteria

- Automation ต้องแก้ไขข้อมูลได้ก่อนบันทึกจริง
- ผู้ใช้ต้องเห็น source และ confidence ของข้อมูลที่ระบบเดา
- ข้อมูลสำคัญต้อง export ได้

## Phase 6: Collaboration and Multi-Home

เป้าหมายคือรองรับครอบครัวและผู้ใช้หลายบ้านอย่างจริงจัง

### Features

- Household members
- Roles and permissions
- Shared homes
- Multi-home dashboard
- Activity log ตามสมาชิก
- Invite flow

### Acceptance Criteria

- เจ้าของบ้านเชิญสมาชิกได้
- สมาชิกมี role เช่น owner, editor, viewer
- RLS ตรวจ permission ทุก query
- Dashboard แยกดูรายบ้านหรือรวมทุกบ้านได้

## Phase 7: Authentication and Security

เป้าหมายคือเพิ่ม account, login และ permission หลังจาก core home record ใช้งานได้จริงแล้ว

### Features

- Sign up
- Sign in
- Sign out
- User profiles
- Home members
- Roles and permissions
- Row Level Security policies

### Acceptance Criteria

- ผู้ใช้ login แล้วเห็นเฉพาะข้อมูลของตัวเอง
- owner/editor/viewer ทำงานตาม permission
- RLS ป้องกันข้อมูลข้าม account
- migration auth ต้องมี test checklist แยก

## Priority Order

1. Home, room
2. Expense, appliance, document
3. Dashboard, timeline
4. Maintenance, warranty
5. Renovation, shopping
6. Mortgage
7. Collaboration
8. Authentication and security
9. Automation

## Release Strategy

- Release เล็กและถี่
- ทุก phase ต้องมี usable workflow ไม่ใช่แค่ data table
- หลีกเลี่ยงการเพิ่ม dependency ก่อนมี pain ชัดเจน
- ให้ database migration เป็น source of truth
- เก็บ feedback หลังแต่ละ phase ก่อนขยาย scope
