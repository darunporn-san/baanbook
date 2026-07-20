# Phase 3 Status

อัปเดตล่าสุด: 2026-07-20

สถานะปัจจุบัน: **Phase 3 implementation ครบใน repo, เหลือ apply migration และ verify ใน Supabase**

## Scope

- Renovation project CRUD แบบพื้นฐาน
- เลือกบ้านในหน้า renovations
- ผูก renovation กับ room ได้
- เก็บ budget, status, contractor และ date range
- Shopping item CRUD แบบพื้นฐาน
- เลือกบ้านในหน้า shopping
- ผูก shopping กับ room หรือ renovation project ได้
- Dashboard แสดง renovation budget และ shopping planned count
- Native edit forms ใช้ `<details>` เพื่อลด client-side complexity

ยังไม่ทำ:

- Quote comparison เต็มระบบ
- Contractor detail table
- Room openings CRUD จริง
- Expense linked to renovation project

## Implemented In Repo

- Migration:
  - `supabase/migrations/20260720007000_phase3_renovation_shopping.sql`
- Healthcheck:
  - `supabase/healthchecks/phase3_renovation_shopping_healthcheck.sql`
- Routes:
  - `/renovations`
  - `/shopping`
- Feature layer:
  - `features/renovations`
  - `features/shopping`
- Repo check command:
  - `npm run phase3:check`

## Migration Required

```text
supabase/migrations/20260720007000_phase3_renovation_shopping.sql
```

หลังรัน migration แล้วตรวจด้วย:

```text
supabase/healthchecks/phase3_renovation_shopping_healthcheck.sql
```
