# BaanBook Documentation

BaanBook คือระบบจัดการข้อมูลบ้านส่วนตัวแบบครบวงจร เป้าหมายหลักคือให้เจ้าของบ้านมีที่เดียวสำหรับเก็บค่าใช้จ่าย งานซ่อมบำรุง รีโนเวท เครื่องใช้ไฟฟ้า เอกสาร Warranty Mortgage Shopping และ Timeline ของบ้าน

เอกสารชุดนี้เป็น Architecture และ Product Blueprint ก่อนเริ่มเขียนโค้ดจริง โดยยังไม่สร้าง component, database หรือ implementation ใด ๆ

## เอกสารในชุดนี้

- [PROJECT.md](./PROJECT.md): วิสัยทัศน์ ขอบเขต ผู้ใช้ และหลักการตัดสินใจของโปรเจกต์
- [ROADMAP.md](./ROADMAP.md): แผนพัฒนาเป็นเฟส ตั้งแต่ MVP ถึงระบบเต็มรูปแบบ
- [FEATURES.md](./FEATURES.md): รายละเอียดฟีเจอร์หลักและพฤติกรรมที่คาดหวัง
- [ARCHITECTURE.md](./ARCHITECTURE.md): โครงสร้างระบบ Next.js, Supabase, Storage และ integration boundaries
- [DATABASE.md](./DATABASE.md): แนวคิด data model, entity, relationship, security และ migration strategy
- [UI.md](./UI.md): โครงสร้างหน้าจอ navigation, layout และ workflow สำคัญ
- [STYLE_GUIDE.md](./STYLE_GUIDE.md): แนวทาง visual design, tone, spacing, components และ accessibility
- [CODING_STANDARD.md](./CODING_STANDARD.md): มาตรฐาน TypeScript, Next.js, Tailwind, shadcn/ui และ Supabase
- [PHASE0_STATUS.md](./PHASE0_STATUS.md): สถานะ Phase 0, checklist และวิธีตรวจว่าพร้อมขึ้น Phase 1 หรือยัง
- [PHASE1_STATUS.md](./PHASE1_STATUS.md): สถานะ Phase 1, migration และขั้นตอน verify MVP Home Record
- [PHASE2_STATUS.md](./PHASE2_STATUS.md): สถานะ Phase 2, migration และขั้นตอน verify Maintenance/Warranty
- [PHASE3_STATUS.md](./PHASE3_STATUS.md): สถานะ Phase 3, migration และขั้นตอน verify Renovation/Shopping
- [PHASE4_STATUS.md](./PHASE4_STATUS.md): สถานะ Phase 4, migration และขั้นตอน verify Mortgage

## Technology Stack

- Next.js สำหรับ web application และ routing
- TypeScript สำหรับ type safety
- Tailwind CSS สำหรับ styling
- shadcn/ui สำหรับ component foundation
- Supabase สำหรับ PostgreSQL, Storage และ backend services

## Product Principle

BaanBook ไม่ควรเป็นแค่ spreadsheet ที่สวยขึ้น แต่ควรเป็น “สมุดประจำบ้าน” ที่เชื่อมโยงข้อมูลระยะยาวได้ เช่น ค่าใช้จ่ายผูกกับห้อง งานซ่อมผูกกับเครื่องใช้ เอกสารผูกกับ warranty และ timeline แสดงประวัติบ้านแบบอ่านย้อนหลังได้

## Architecture Principle

ระบบควรเริ่มจากโมเดลข้อมูลที่ตรงไปตรงมา รองรับบ้านเดียวก่อน และแบ่ง feature domain ชัดเจนเพื่อลดการพึ่งพากันเกินจำเป็น ส่วน authentication และ RLS ถูกเลื่อนไปเฟสหลัง
