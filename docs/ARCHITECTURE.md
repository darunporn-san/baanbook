# System Architecture

## Overview

BaanBook เป็น web application ที่ใช้ Next.js เป็น frontend และ application layer ส่วน Supabase ทำหน้าที่เป็น backend platform สำหรับ PostgreSQL, Storage และ backend services

สถาปัตยกรรมควรเริ่มแบบ modular monolith ใน Next.js ก่อน ไม่ควรแยก microservices ตั้งแต่ต้น เพราะ domain ยังเปลี่ยนได้ และทีมจะได้พัฒนาเร็วกว่า

## High-Level Architecture

```text
User Browser
    |
    v
Next.js App Router
    |
    +-- Server Components for data-heavy pages
    +-- Client Components for forms, filters, interactions
    +-- Server Actions / Route Handlers for mutations
    |
    v
Supabase
    |
    +-- PostgreSQL
    +-- Storage
    +-- Realtime
```

## Architectural Principles

- ใช้ TypeScript type ชัดเจนที่ boundary ของ data access
- แยก feature domain ตาม business area
- ลด global state ให้น้อยที่สุด ใช้ URL state สำหรับ filter/search ที่ควร share ได้
- ใช้ Server Components สำหรับ page ที่อ่านข้อมูลเป็นหลัก
- ใช้ Client Components เฉพาะส่วนที่ต้อง interactive จริง
- ทำ mutation ผ่าน Server Actions หรือ Route Handlers ที่ validate input เสมอ
- เก็บไฟล์ใน private Supabase Storage bucket

## Suggested Folder Architecture

โครงสร้างนี้เป็นแนวทางเมื่อเริ่มเขียนโค้ดจริง ยังไม่ต้องสร้างในตอนนี้

```text
app/
  (app)/
    dashboard/
    homes/
    expenses/
    renovations/
    appliances/
    documents/
    maintenance/
    warranties/
    timeline/
    shopping/
    mortgage/
components/
  ui/
  layout/
  shared/
features/
  homes/
  expenses/
  renovations/
  appliances/
  documents/
  maintenance/
  warranties/
  timeline/
  shopping/
  mortgage/
lib/
  supabase/
  validation/
  format/
  permissions/
types/
```

## Feature Module Pattern

แต่ละ feature ควรมีส่วนประกอบหลักต่อไปนี้เมื่อจำเป็น

```text
features/[domain]/
  actions.ts
  queries.ts
  schema.ts
  types.ts
  components/
```

### queries.ts

ใช้สำหรับ read operation เท่านั้น เช่น list expenses, get appliance detail, get dashboard summary

### actions.ts

ใช้สำหรับ mutation เช่น create, update, archive, upload metadata โดยต้อง validate input เสมอ

### schema.ts

ใช้สำหรับ validation schema เช่น form input และ server action input

### types.ts

ใช้สำหรับ domain type ที่ไม่ใช่ database generated type โดยตรง

## Rendering Strategy

### Server Components

เหมาะกับ:

- Dashboard
- List pages
- Detail pages
- Document metadata
- Timeline

ข้อดีคือ data fetching อยู่ server-side ลด client bundle และปลอดภัยกว่าในการอ่านข้อมูล

### Client Components

เหมาะกับ:

- Form
- Modal
- Drawer
- Date picker
- File upload
- Filter controls
- Inline edit
- Charts ที่ต้อง interactive

ควรทำให้ client component เล็กและอยู่ใกล้จุดใช้งาน

## Authentication

Authentication ถูกตัดออกจาก Phase 0 แล้ว ระบบช่วงแรกเป็น no-auth private foundation เพื่อให้ home, room และ core data flow เสถียรก่อน

Auth, user profile, member role และ Row Level Security จะกลับมาเป็นเฟสแยกหลังจาก Phase 1 foundation พร้อมแล้ว

## Data Access Pattern

แนะนำให้ใช้ Supabase client สองแบบ

- Browser client สำหรับ client component ที่จำเป็นต้องอ่าน session หรือ upload file
- Server client สำหรับ server component, server action และ route handler

ทุก query ควร filter ด้วย home_id เมื่อทำงานใน context ของบ้าน เพื่อ performance และความชัดเจน

## File Storage Architecture

ใช้ Supabase Storage แบบ private bucket

### Bucket

- `home-documents`
- `home-images`

### Path Convention

```text
homes/{home_id}/documents/{document_id}/{filename}
homes/{home_id}/images/{entity_type}/{entity_id}/{filename}
```

### Access

- Upload ต้องผูกกับ home_id ที่ถูกต้อง
- Download/preview ใช้ signed URL อายุสั้น
- Metadata ของไฟล์อยู่ใน database ไม่ใช่พึ่ง storage path อย่างเดียว

## Timeline Architecture

Timeline สามารถสร้างได้สองแนวทาง

### Option A: Materialized Timeline Events

มีตาราง `timeline_events` ที่ถูกสร้างเมื่อเกิด action สำคัญ

ข้อดี:

- query ง่าย
- timeline เร็ว
- รองรับ manual note

ข้อเสีย:

- ต้องดูแล consistency

### Option B: Derived Timeline

ดึงจากหลายตารางแล้วรวมใน application

ข้อดี:

- ไม่ duplicate ข้อมูล

ข้อเสีย:

- query ซับซ้อน
- filter ยาก
- performance แย่ลงเมื่อข้อมูลโต

### Recommendation

ใช้ Option A สำหรับ BaanBook เพราะ timeline เป็น feature หลักและต้องรองรับ manual note อยู่แล้ว

## Dashboard Architecture

Dashboard ควรใช้ query เฉพาะที่ aggregate ข้อมูลสำหรับ widget แทนการดึงทุก record

### Example Widgets

- ค่าใช้จ่ายเดือนนี้
- maintenance upcoming
- warranty ใกล้หมด
- renovation active
- mortgage summary
- timeline ล่าสุด

ในอนาคตอาจใช้ database view หรือ materialized view หาก dashboard ช้า แต่ไม่ต้องเริ่มจากตรงนั้น

## Realtime Strategy

Realtime ไม่จำเป็นสำหรับ MVP ยกเว้น collaboration

ควรใช้แบบจำกัดเมื่อมี use case ชัดเจน เช่น:

- สมาชิกครอบครัวแก้ task พร้อมกัน
- dashboard update เมื่อมีคนเพิ่ม expense
- activity feed

## Background Jobs

Supabase ไม่มี long-running job แบบเต็มในตัว application จึงควรเริ่มจาก scheduled checks ง่าย ๆ ก่อน

Candidate jobs:

- reminder สำหรับ maintenance due soon
- warranty expiring soon
- recurring maintenance generation
- recurring expense generation

ใน MVP สามารถคำนวณ upcoming จาก query ก่อน ยังไม่ต้องสร้าง job หากยังไม่มี notification จริง

## Validation Strategy

ใช้ validation ที่ server boundary เสมอ

- Form validation เพื่อ UX
- Server validation เพื่อความถูกต้อง
- Database constraint เพื่อความปลอดภัยของ data integrity

ข้อมูลเงิน วันที่ owner และ foreign key ไม่ควรพึ่ง UI validation อย่างเดียว

## Error Handling

### User-Facing Errors

- แสดงข้อความสั้น ชัดเจน และบอกว่าผู้ใช้ควรทำอะไร
- ไม่แสดง database error ตรง ๆ
- Form error ต้องผูกกับ field ให้มากที่สุด

### Developer Errors

- Log server error พร้อม context
- หลีกเลี่ยงการ log personal document data หรือ sensitive field

## Observability

เริ่มจากสิ่งจำเป็น:

- Application logs
- Supabase query errors
- Storage upload failures

เมื่อระบบโตขึ้นค่อยเพิ่ม:

- Error tracking
- Performance monitoring
- Audit log

## Security Architecture

### Required In No-Auth Phase 0

- Private storage bucket
- Server-side validation
- File size/type restrictions
- No service role key in browser
- Environment variable separation

### Required When Auth Returns

- RLS ทุกตารางที่มีข้อมูลผู้ใช้
- Ownership checks
- No service role key in browser

### Sensitive Data

ข้อมูลเหล่านี้ต้องระวังเป็นพิเศษ:

- เอกสารบ้าน
- สัญญา
- ที่อยู่
- mortgage detail
- serial number
- เบอร์ติดต่อ vendor

## Scalability

สำหรับ personal home management ระบบจะโตจากจำนวน record ต่อบ้านมากกว่าจำนวน request ต่อวินาทีในช่วงแรก

ควร optimize:

- index ตาม home_id
- index ตาม date และ status
- pagination ใน list ขนาดใหญ่
- storage metadata
- dashboard aggregate query

ไม่ควรรีบทำ:

- microservices
- custom caching layer
- event bus
- complex CQRS

## Deployment

แนวทาง deployment ที่เหมาะสม:

- Vercel สำหรับ Next.js
- Supabase cloud สำหรับ backend
- Environment แยก dev, staging, production
- Database migration ผ่าน CLI หรือ migration tool ที่ทีมเลือก

## Risk Areas

- Auth/RLS ถูกเพิ่มเร็วเกินไปทำให้ Phase 0 ช้าและ debug ยาก
- Document storage permission ไม่ตรงกับ database permission
- Dashboard query ช้าเมื่อข้อมูลโต
- Timeline consistency หาก action สำเร็จบางส่วน
- Mortgage calculation อาจถูกตีความเป็นคำแนะนำทางการเงิน

## Architecture Decision Records

ควรสร้าง ADR เพิ่มเมื่อมีการตัดสินใจใหญ่ เช่น:

- เลือก Server Actions หรือ API routes เป็น mutation boundary
- เลือก timeline แบบ materialized
- เลือก strategy สำหรับ recurring task
- เลือก notification provider
