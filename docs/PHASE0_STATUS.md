# Phase 0 Status

อัปเดตล่าสุด: 2026-07-20

สถานะปัจจุบัน: **Phase 0 จบแล้ว ถ้าสร้าง home ได้จริงในแอป**

## Phase 0 Goal

Phase 0 ตอนนี้เป็น **no-auth private foundation** ตามการตัดสินใจล่าสุด: ตัดหน้า login, sign up, sign in, sign out และ auth middleware ออกทั้งหมดก่อน เพื่อให้โฟกัสกับฐาน home record ที่ใช้งานได้เร็ว

เป้าหมาย Phase 0:

- เปิดแอปแล้วเข้า dashboard ได้ทันที
- สร้าง home แรกได้
- มี app shell, sidebar, header และ routes พื้นฐาน
- มี Supabase connection สำหรับ `homes` และ `rooms`
- มี migration workflow และ healthcheck
- ยังไม่ทำ authentication, account, member, role หรือ RLS

## Done In Repo

- Next.js, TypeScript, Tailwind และ shadcn-style foundation
- Supabase browser/server clients
- Environment helper รองรับทั้ง `NEXT_PUBLIC_SUPABASE_ANON_KEY` และ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- App shell พร้อม sidebar และ header
- Routes:
  - `/`
  - `/dashboard`
  - `/homes`
  - `/settings`
  - `/api/health/supabase`
- First home creation form
- Home query/action layer
- Migration SQL สำหรับ:
  - `homes`
  - `rooms`
  - `updated_at` triggers
- Healthcheck SQL สำหรับตรวจ:
  - tables
  - triggers
  - helper function
- Repo check command:
  - `npm run phase0:check`

## Removed From Current Phase

สิ่งเหล่านี้ถูกตัดออกจาก Phase 0 แล้ว:

- `/login`
- sign in
- sign up
- sign out
- auth route handlers
- auth server actions
- auth middleware
- flash auth messages
- `profiles`
- `home_members`
- owner/member roles
- RLS policies ที่อิง `auth.uid()`

เหตุผล: ลดความซับซ้อนก่อน ให้ Phase 0 จบเป็นฐาน no-auth ที่เสถียร แล้วค่อยเพิ่ม auth เป็นเฟสแยกเมื่อ data model หลักนิ่ง

## Final Verification

ถ้าสร้าง home ได้แล้ว ให้ถือว่า Phase 0 ผ่าน criteria หลักแล้ว:

- เข้า `/dashboard`
- create first home
- refresh หน้า
- home ยังแสดงอยู่
- เปิด `/homes`
- เห็น home ที่สร้างไว้

## How To Check Repo

ใช้คำสั่งเดียว:

```bash
npm run phase0:check
```

คำสั่งนี้จะรัน:

- TypeScript check
- ESLint
- Next.js production build

## How To Check Supabase Connection

หลังเปิด dev server แล้ว เข้า URL นี้:

```text
http://localhost:3000/api/health/supabase
```

ถ้า Next.js เลือก port อื่น เช่น `3001` ให้ใช้ port นั้นแทน:

```text
http://localhost:3001/api/health/supabase
```

ผลที่ถือว่าผ่าน:

```json
{
  "ok": true,
  "env": true,
  "database": true
}
```

ถ้า `env` เป็น `false` แปลว่า `.env` ยังไม่ครบ

ถ้า `env` เป็น `true` แต่ `database` เป็น `false` แปลว่าเชื่อม Supabase ได้แล้ว แต่ยังไม่ได้ apply migration หรือ table ยังไม่พร้อม

ถ้าสร้าง home แล้วเจอ `new row violates row-level security policy for table "homes"` แปลว่า Supabase ยังเหลือ RLS จาก schema auth เก่า ให้รัน:

```text
supabase/migrations/20260720001000_remove_auth_rls_for_no_auth_phase0.sql
```

## How To Apply Supabase Migration

วิธีที่ตรงที่สุดตอนนี้คือ Supabase Dashboard:

1. เปิด Supabase project
2. ไปที่ SQL Editor
3. เปิดไฟล์ `supabase/migrations/20260720000000_phase0_foundation.sql`
4. Copy SQL ทั้งไฟล์ไป run
5. ถ้าเคยรัน migration เก่าที่มี auth/RLS ให้ run `supabase/migrations/20260720001000_remove_auth_rls_for_no_auth_phase0.sql`
6. Run `supabase/healthchecks/phase0_foundation_healthcheck.sql`

ถ้าจะใช้ Supabase CLI ภายหลัง ค่อยเพิ่ม CLI workflow เมื่อมี access token และ project link พร้อมแล้ว

## Phase 0 Done Criteria

ถือว่า Phase 0 จบเมื่อครบทุกข้อ:

- `npm run phase0:check` ผ่าน
- Supabase healthcheck ผ่านครบ
- เข้า `/dashboard` ได้โดยไม่มี auth redirect
- สร้าง home แรกได้จริง
- dashboard แสดง home ที่สร้างแล้ว
- `/homes` แสดง home ที่สร้างแล้ว

## Next Phase

เริ่ม Phase 1 ต่อที่ [PHASE1_STATUS.md](./PHASE1_STATUS.md)

ลำดับ Phase 1:

1. Room management
2. Expense tracking
3. Appliance inventory
4. Document upload
5. Basic dashboard
6. Basic timeline

Authentication ให้ทำเป็นเฟสแยกหลัง Phase 1 foundation นิ่งแล้ว
