# Features

เอกสารนี้อธิบาย feature domain ของ BaanBook พร้อมหน้าที่ ข้อมูลสำคัญ และ workflow ที่ควรรองรับ

## 1. Home Management

Home คือ root entity ของระบบ ข้อมูลส่วนใหญ่ต้องผูกกับ home เพื่อรองรับ multi-home ในอนาคต

### Capabilities

- สร้าง แก้ไข และ archive บ้าน
- เก็บชื่อบ้าน ประเภทบ้าน ที่อยู่ และวันที่เข้าอยู่
- เก็บรูปภาพหลักของบ้าน
- จัดการห้องหรือพื้นที่ภายในบ้าน
- กำหนดค่า default currency และ timezone

### Key Fields

- Home name
- Home type เช่น house, condo, townhouse
- Address
- Move-in date
- Ownership type เช่น owned, rented, family-owned
- Notes

## 2. Room and Area

Room ใช้เป็น context สำหรับ expense, appliance, maintenance, document และ renovation

### Capabilities

- สร้างห้องหรือพื้นที่ เช่น ห้องนอน ห้องน้ำ ครัว โรงรถ สวน
- จัดกลุ่มตามชั้นหรือ zone
- ผูก item, task และ document กับ room

### User Value

ผู้ใช้สามารถตอบคำถามได้ว่า “ห้องครัวเคยซ่อมอะไรไปบ้าง”, “เครื่องใช้ในห้องนั่งเล่นมีอะไรบ้าง” หรือ “ค่ารีโนเวทห้องน้ำรวมเท่าไร”

## 3. Expense

Expense ใช้เก็บค่าใช้จ่ายเกี่ยวกับบ้านทุกประเภท

### Categories

- Utilities เช่น ไฟฟ้า น้ำ อินเทอร์เน็ต
- Maintenance
- Renovation
- Appliance
- Furniture
- Cleaning
- Insurance
- Tax
- Mortgage
- Other

### Capabilities

- บันทึกค่าใช้จ่ายพร้อมวันที่ จำนวนเงิน หมวดหมู่ และ note
- แนบ receipt หรือเอกสาร
- ผูกกับ home, room, appliance, renovation หรือ mortgage payment
- ตั้ง recurring expense สำหรับค่าใช้จ่ายประจำ
- ดูสรุปรายเดือน รายปี และตามหมวด

### Important Rules

- Amount ควรเก็บเป็นหน่วยย่อย เช่น satang หรือ cent เพื่อลดปัญหา floating point
- Expense ต้องมี date และ currency เสมอ
- Delete ควรเป็น soft delete หากมีผลต่อรายงานย้อนหลัง

## 4. Renovation

Renovation คือ project หรือ activity ที่ปรับปรุงบ้าน มีงบ เวลา vendor และค่าใช้จ่ายที่เกี่ยวข้อง

### Capabilities

- สร้าง renovation project
- กำหนด status เช่น planning, active, paused, completed, cancelled
- กำหนด budget, start date, end date
- ผูก contractor/vendor
- ผูก expense และ document
- เก็บ before/after notes และรูปภาพ

### User Value

ผู้ใช้เห็นได้ว่างานรีโนเวทใช้งบเท่าไร เกินงบไหม มีเอกสารอะไร ใครเป็นผู้รับเหมา และเกิดอะไรขึ้นตาม timeline

## 5. Appliance and Asset Inventory

ใช้จัดการเครื่องใช้ไฟฟ้าและทรัพย์สินสำคัญในบ้าน

### Examples

- ตู้เย็น
- เครื่องซักผ้า
- แอร์
- ทีวี
- เครื่องกรองน้ำ
- เตาอบ
- ปั๊มน้ำ
- กล้องวงจรปิด

### Capabilities

- บันทึกชื่อ รุ่น serial number ยี่ห้อ และหมวดหมู่
- บันทึกวันที่ซื้อ ราคา ร้านค้า และตำแหน่ง
- ผูก warranty
- แนบใบเสร็จ คู่มือ หรือรูปภาพ
- บันทึก maintenance history
- ระบุสถานะ เช่น active, repaired, replaced, disposed

## 6. Document Vault

Document คือศูนย์กลางไฟล์สำคัญเกี่ยวกับบ้าน

### Document Types

- โฉนดหรือเอกสารกรรมสิทธิ์
- สัญญาซื้อขาย
- ใบเสร็จ
- ใบรับประกัน
- คู่มือเครื่องใช้
- แบบบ้าน
- ใบเสนอราคา
- เอกสารประกันภัย
- เอกสาร mortgage

### Capabilities

- Upload ไฟล์
- ใส่ metadata เช่น type, issue date, expiry date
- ผูกกับ entity อื่น เช่น appliance, expense, renovation, mortgage
- ค้นหาตามชื่อ ประเภท tag และวันที่
- Download และ preview

### Security Notes

เอกสารบ้านอาจมีข้อมูลส่วนตัวสูง ต้องใช้ private storage bucket และเข้าถึงผ่าน signed URL เมื่อทำระบบเอกสารจริง

## 7. Maintenance

Maintenance คือ task สำหรับดูแลบ้านและเครื่องใช้

### Capabilities

- สร้าง maintenance task
- กำหนด due date, priority, status และ assignee
- ทำ recurring schedule เช่น ทุก 3 เดือน ทุก 6 เดือน ทุกปี
- ผูกกับ appliance, room หรือ home
- แนบรูปก่อน/หลังและใบเสร็จ
- แปลง task ที่เสร็จแล้วเป็น timeline event

### Status

- todo
- scheduled
- in_progress
- done
- skipped
- cancelled

## 8. Warranty

Warranty อาจอยู่กับ appliance, renovation work หรือ purchase item

### Capabilities

- บันทึกวันเริ่มและวันหมด warranty
- เก็บผู้ให้บริการ เบอร์ติดต่อ และเงื่อนไข
- แนบใบรับประกัน
- แสดง warranty ใกล้หมด
- Link กับ maintenance หรือ claim history

## 9. Timeline

Timeline คือประวัติบ้านแบบเรียงเวลา เป็นทั้ง activity log และ home journal

### Event Sources

- สร้างบ้าน
- เพิ่มค่าใช้จ่ายสำคัญ
- เพิ่มเครื่องใช้
- งาน maintenance เสร็จ
- เริ่มหรือจบ renovation
- อัปโหลดเอกสารสำคัญ
- บันทึก mortgage payment
- เพิ่ม note manual

### Capabilities

- แสดง event ตามเวลา
- Filter ตาม category, room, item หรือ user
- รองรับ manual note
- Link กลับไป record ต้นทาง

## 10. Shopping

Shopping ใช้จัดการของที่ต้องซื้อเกี่ยวกับบ้าน

### Capabilities

- สร้าง shopping item
- กำหนด priority, budget, target room และ status
- เก็บ link ร้านค้า ราคาโดยประมาณ และ note
- เปลี่ยน item เป็น expense เมื่อซื้อแล้ว
- ผูกกับ renovation project

## 11. Mortgage

Mortgage ใช้ติดตามข้อมูลสินเชื่อบ้านแบบ personal tracking

### Capabilities

- บันทึก lender, principal, interest rate, term และ start date
- บันทึก payment history
- แยก principal, interest และ fee หากผู้ใช้มีข้อมูล
- แสดง outstanding balance แบบประมาณการจากข้อมูลที่บันทึก
- แนบเอกสาร mortgage

### Legal and Financial Boundary

ระบบควรแสดงผลจากข้อมูลที่ผู้ใช้กรอกเท่านั้น และต้องไม่สื่อว่าเป็นคำแนะนำทางการเงิน

## 12. Dashboard

Dashboard คือ first screen สำหรับตอบคำถาม “บ้านตอนนี้เป็นอย่างไร”

### Widgets

- Monthly expense summary
- Upcoming maintenance
- Expiring warranty
- Recent documents
- Active renovation
- Mortgage snapshot
- Recent timeline
- Shopping pending

### Design Goal

Dashboard ต้อง scan ได้เร็ว ไม่ควรเป็นหน้า marketing และไม่ควรบังคับให้ผู้ใช้กรอกข้อมูลจำนวนมากก่อนเห็นคุณค่า
