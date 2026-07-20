# Phase 1 Status

อัปเดตล่าสุด: 2026-07-20

สถานะปัจจุบัน: **Phase 1 implementation ครบใน repo และต่อยอดเป็น multi-home flow แล้ว**

Phase 1 เป้าหมายคือทำให้ BaanBook เริ่มเก็บข้อมูลบ้านพื้นฐานได้จริง โดยต่อจาก Phase 0 no-auth foundation ที่สร้าง home ได้แล้ว

## Phase 1 Scope

ทำเฉพาะ MVP Home Record:

- Room management
- Expense tracking
- Appliance inventory
- Document upload
- Basic dashboard
- Basic timeline

ยังไม่ทำ:

- Authentication
- Member sharing
- RLS
- Maintenance recurring
- Warranty reminder
- Mortgage
- Automation

## Implemented In Repo

- Room management
- Expense tracking
- Appliance inventory
- Document metadata and upload form
- Inline CRUD สำหรับ rooms, expenses, appliances และ documents
- Multi-home selector สำหรับ dashboard, expenses, appliances, documents และ timeline
- `/homes` เป็นรายการบ้าน ส่วน rooms อยู่ใน `/homes/[homeId]`
- Room form ใช้ field หลัก:
  - name
  - floor
  - width
  - length
  - height
- Supabase Storage bucket migration สำหรับ `home-documents`
- Basic dashboard widgets
- Basic timeline events
- Repo check command:
  - `npm run phase1:check`
- Navigation routes:
  - `/homes`
  - `/expenses`
  - `/appliances`
  - `/documents`
  - `/timeline`
- Phase 1 health endpoint ผ่าน route เดิม:
  - `/api/health/supabase`

## Current Priority

งานถัดไปของ Phase 1 คือ verify UI จริงหลัง apply migration ครบใน Supabase

เหตุผล:

- Room เป็น context หลักของบ้าน
- Expense, appliance, document, maintenance และ renovation จะผูกกับ room ได้ภายหลัง
- ทำก่อนจะลดการแก้ schema/UI ซ้ำตอนเพิ่ม feature อื่น

## Step 1: Room Management

### Goal

ผู้ใช้สามารถจัดการห้องหรือพื้นที่ในบ้านที่เลือกได้

### Expected UI

- หน้า `/homes` แสดง home ที่มีอยู่
- กด `Open` เพื่อเข้า `/homes/[homeId]`
- ใน `/homes/[homeId]` แสดง rooms ของ home นั้น
- มี form เพิ่ม room
- มี list ห้อง
- มีปุ่มลบหรือ archive ห้องแบบง่าย

### Data

ใช้ table `rooms` ที่มีอยู่แล้วใน Phase 0 migration:

- `id`
- `home_id`
- `name`
- `floor`
- `width_m`
- `length_m`
- `height_m`
- `notes`
- `sort_order`
- `deleted_at`

### Minimal Implementation

เริ่มจาก field เท่าที่จำเป็น:

- `name`
- `floor`
- `width_m`
- `length_m`
- `height_m`

ยังไม่ต้องทำ:

- room image
- drag-and-drop sorting
- room detail page
- advanced filtering

### Acceptance Criteria

- ถ้ายังไม่มี home ให้แสดง create home flow ก่อน
- ถ้ามี home แล้ว ผู้ใช้เปิด home detail แล้วเพิ่ม room ได้
- rooms แสดงตาม home ที่เปิดอยู่
- room ที่ deleted แล้วไม่แสดงใน list
- refresh หน้าแล้วยังเห็น room ที่เพิ่มไว้
- `npm run phase1:check` ผ่าน

## Step 2: Expense Tracking

เริ่มหลัง Room Management ผ่าน

### Minimal Scope

- เพิ่ม expense
- เลือก room ได้
- ใส่ title, amount, date, category, notes และวันที่/เวลานัดหมายถ้ามี
- list expense ล่าสุด
- summary ค่าใช้จ่ายเดือนนี้แบบง่าย

## Step 3: Appliance Inventory

เริ่มหลัง Expense Tracking หรือทำคู่ขนานได้ถ้า Room Management นิ่งแล้ว

### Minimal Scope

- เพิ่ม appliance
- ผูกกับ room
- เก็บ name, brand, model, purchase date, warranty end date
- list appliance ตาม room

## Step 4: Document Upload

เริ่มหลัง core data flow ของ home/room ใช้งานได้แล้ว

### Minimal Scope

- สร้าง Supabase Storage bucket
- upload document
- เก็บ metadata ใน database
- ผูก document กับ home หรือ room

## Step 5: Basic Dashboard

ปรับ dashboard จาก placeholder เป็น summary จริง

### Minimal Widgets

- จำนวน rooms
- ค่าใช้จ่ายเดือนนี้
- จำนวน appliances
- เอกสารล่าสุด

## Step 6: Basic Timeline

เริ่มจาก materialized event แบบง่าย

### Minimal Events

- home created
- room added
- expense added
- appliance added
- document uploaded

## Phase 1 Done Criteria

ถือว่า Phase 1 จบเมื่อ:

- สร้าง ดู แก้ และลบ rooms ได้
- สร้าง ดู แก้ และลบ expenses ได้
- สร้าง ดู แก้ และลบ appliances ได้
- สร้าง ดู แก้ และลบ document metadata ได้
- upload document ได้
- dashboard แสดงข้อมูลจริงอย่างน้อย 3 widgets
- timeline แสดง event จาก action สำคัญ
- repo check ผ่าน
- Supabase healthcheck ผ่าน

## Migration Required

ต้องรัน migration นี้ใน Supabase SQL Editor:

```text
supabase/migrations/20260720002000_phase1_mvp_home_record.sql
```

ถ้าเคยรัน migration แล้วแต่เพิ่ม expense/appliance/document ไม่เข้า และ error เป็น `new row violates row-level security policy` ให้รัน migration ซ่อมนี้:

```text
supabase/migrations/20260720003000_disable_phase1_rls_for_no_auth.sql
```

ถ้าฐานข้อมูลเก่ายังไม่มีช่องรายละเอียดค่าใช้จ่าย ให้รัน migration ซ่อมนี้:

```text
supabase/migrations/20260720011000_ensure_expense_notes.sql
```

ถ้าฐานข้อมูลเก่ายังไม่มีช่องนัดหมายของค่าใช้จ่าย ให้รัน migration นี้:

```text
supabase/migrations/20260720012000_add_expense_appointment.sql
```

หลังรันแล้วเปิด:

```text
/api/health/supabase
```

ผลที่ควรได้:

```json
{
  "ok": true,
  "env": true,
  "database": true
}
```

Repo check:

```bash
npm run phase1:check
```

## Next Action

ทดสอบ flow จริง:

- เพิ่ม room
- เพิ่ม expense
- เพิ่ม appliance
- เพิ่ม document
- ดู dashboard summary
- ดู timeline
