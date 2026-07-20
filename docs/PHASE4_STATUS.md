# Phase 4 Status

อัปเดตล่าสุด: 2026-07-20

สถานะปัจจุบัน: **Phase 4 implementation ครบใน repo, เหลือ apply migration และ verify ใน Supabase**

## Scope

- Mortgage profile แบบพื้นฐาน
- Mortgage profile CRUD แบบพื้นฐาน
- เลือกบ้านในหน้า mortgage
- เก็บ lender, principal, interest rate, term, start date และ monthly payment
- Mortgage payment history
- Mortgage payment CRUD แบบพื้นฐาน
- Outstanding balance แบบ manual calculation จาก principal paid
- Dashboard แสดง mortgage outstanding
- Native edit forms ใช้ `<details>` เพื่อลด client-side complexity

ข้อจำกัด:

- ไม่ใช่ financial advice
- ยังไม่ generate amortization schedule
- principal/interest split เป็นข้อมูลที่ผู้ใช้กรอกเอง
- ยังรองรับหนึ่ง mortgage profile หลักต่อบ้านใน UI

## Implemented In Repo

- Migration:
  - `supabase/migrations/20260720008000_phase4_mortgage.sql`
- Healthcheck:
  - `supabase/healthchecks/phase4_mortgage_healthcheck.sql`
- Routes:
  - `/mortgage`
- Feature layer:
  - `features/mortgage`
- Repo check command:
  - `npm run phase4:check`

## Migration Required

```text
supabase/migrations/20260720008000_phase4_mortgage.sql
```

หลังรัน migration แล้วตรวจด้วย:

```text
supabase/healthchecks/phase4_mortgage_healthcheck.sql
```
