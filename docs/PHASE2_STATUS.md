# Phase 2 Status

อัปเดตล่าสุด: 2026-07-20

สถานะปัจจุบัน: **Phase 2 implementation ครบใน repo และ `npm run phase2:check` ผ่านแล้ว, เหลือ apply migration และ verify ใน Supabase**

Phase 2 เป้าหมายคือเพิ่ม workflow สำหรับดูแลบ้านจริง: maintenance task และ warranty tracking โดยต่อจาก Phase 1 multi-home home record

## Phase 2 Scope

ทำใน Phase นี้:

- Maintenance task CRUD
- เลือกบ้านในหน้า maintenance
- ผูก maintenance กับ room หรือ appliance
- Status board: overdue, upcoming, completed
- Complete task แล้วสร้าง timeline event
- Warranty tracking จาก appliance warranty end date
- เลือกบ้านในหน้า warranty
- Dashboard แสดง maintenance และ warranty summary
- Room dimensions อยู่ที่ room ไม่ใช่ home:
  - width
  - length
  - height
- Room opening counts อยู่ที่ room:
  - windows
  - doors
  - balconies
- Room opening details อยู่ที่ room:
  - type: window, door, balcony, other
  - label
  - width
  - height
  - quantity
- Room UI ตัด Type และ Zone ออกแล้ว
- `/homes/[homeId]` มี Renovation Rooms view:
  - room size
  - floor area estimate
  - wall area estimate
  - volume
  - openings count overview สำหรับ windows/doors/balconies
  - opening size list และ add/delete opening ต่อห้อง

ยังไม่ทำ:

- Recurring generator อัตโนมัติ
- Notification/reminder จริง
- Warranty table แยก
- Claim workflow
- Calendar view
- Attachment before/after maintenance
- Edit opening รายชิ้น
- Opening material, curtain, built-in measurement

เหตุผล: เริ่มจาก workflow ที่ใช้งานได้ทันที และหลีกเลี่ยง scheduler/notification ก่อนระบบ core เสถียร

## Implemented In Repo

- Migration:
  - `supabase/migrations/20260720004000_phase2_maintenance_warranty.sql`
  - `supabase/migrations/20260720006000_move_dimensions_from_homes_to_rooms.sql`
  - `supabase/migrations/20260720009000_add_room_opening_counts.sql`
  - `supabase/migrations/20260720010000_add_room_openings.sql`
- Healthcheck:
  - `supabase/healthchecks/phase2_maintenance_warranty_healthcheck.sql`
    - ตรวจ `maintenance_tasks`
    - ตรวจ `rooms.width_m`, `rooms.length_m`, `rooms.height_m`
    - ตรวจ `rooms.window_count`, `rooms.door_count`, `rooms.balcony_count`
    - ตรวจ `room_openings`
- Routes:
  - `/maintenance`
  - `/warranty`
- Feature layer:
  - `features/maintenance/queries.ts`
  - `features/maintenance/actions.ts`
- Components:
  - `components/maintenance/create-maintenance-form.tsx`
  - `components/maintenance/maintenance-row.tsx`
  - `components/room/room-row.tsx` ปรับเป็น renovation room card
- Navigation:
  - Sidebar เพิ่ม Maintenance และ Warranty
- Dashboard:
  - Maintenance overdue/upcoming
  - Warranty expiring soon
- Repo check command:
  - `npm run phase2:check`

## Done Criteria

ถือว่า Phase 2 จบเมื่อ:

- ผู้ใช้สร้าง maintenance task พร้อม due date ได้
- ผู้ใช้ edit/delete maintenance task ได้
- ผู้ใช้ mark task เป็น done ได้
- task ที่ done สร้าง timeline event
- หน้า maintenance แสดง overdue, upcoming และ completed ได้
- หน้า warranty แสดง active, expiring soon และ expired จาก appliance warranty date ได้
- dashboard แสดง Phase 2 summary
- room เก็บและแสดง width, length, height ได้
- room เก็บและแสดงจำนวน windows, doors, balconies ได้
- room เก็บและแสดงรายการ opening พร้อม width, height และ quantity ได้
- room form ไม่ใช้ Type และ Zone แล้ว
- home detail แสดง renovation room card พร้อม floor area, wall area, volume และ openings overview
- `npm run phase2:check` ผ่าน

## Migration Required

ต้องรัน migration เหล่านี้ใน Supabase SQL Editor ตามลำดับ:

```text
supabase/migrations/20260720004000_phase2_maintenance_warranty.sql
supabase/migrations/20260720006000_move_dimensions_from_homes_to_rooms.sql
supabase/migrations/20260720009000_add_room_opening_counts.sql
supabase/migrations/20260720010000_add_room_openings.sql
```

หมายเหตุ: ถ้าเคยรัน migration ผิดที่เพิ่ม dimension เข้า `homes` แล้ว migration `20260720006000_move_dimensions_from_homes_to_rooms.sql` จะลบ column เหล่านั้นจาก `homes` และเพิ่มเข้า `rooms` ให้ถูกต้อง

หลังรัน migration แล้วตรวจด้วย:

```text
supabase/healthchecks/phase2_maintenance_warranty_healthcheck.sql
```

Repo check:

```bash
npm run phase2:check
```
