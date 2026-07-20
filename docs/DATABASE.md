# Database Design

เอกสารนี้เป็น conceptual database design สำหรับ Supabase PostgreSQL ยังไม่ใช่ migration และยังไม่สร้าง database จริง

## Design Principles

- ทุกข้อมูลหลักต้องผูกกับ `home_id`
- Phase 0 เป็น no-auth schema จึงยังไม่เปิด Row Level Security
- ใช้ UUID เป็น primary key
- ใช้ `created_at`, `updated_at` และ `deleted_at` สำหรับ record สำคัญ
- ใช้ soft delete กับข้อมูลที่มีผลต่อประวัติหรือรายงาน
- เก็บจำนวนเงินเป็น integer minor unit เช่น satang
- ใช้ enum หรือ check constraint สำหรับ status ที่มีค่าจำกัด
- ใช้ foreign key เพื่อรักษาความถูกต้องของข้อมูล

## Core Entities

### homes

บ้านหรือ property ที่ผู้ใช้จัดการ

Fields:

- id
- name
- home_type
- ownership_type
- address_line
- city
- province
- country
- postal_code
- move_in_date
- default_currency
- timezone
- cover_image_path
- notes
- archived_at
- created_at
- updated_at

### rooms

พื้นที่ภายในบ้าน

Fields:

- id
- home_id
- name
- floor
- width_m
- length_m
- height_m
- zone legacy optional
- room_type legacy optional
- notes
- sort_order
- created_at
- updated_at
- deleted_at

## Expense Domain

### expense_categories

หมวดค่าใช้จ่าย อาจเริ่มเป็น system categories และเปิด custom ภายหลัง

Fields:

- id
- home_id nullable หากเป็น global category
- name
- color
- icon
- sort_order
- created_at

### expenses

ค่าใช้จ่ายเกี่ยวกับบ้าน

Fields:

- id
- home_id
- room_id nullable
- category_id
- title
- description
- amount_minor
- currency
- expense_date
- vendor_id nullable
- payment_method
- recurring_rule_id nullable
- source_type nullable
- source_id nullable
- created_by
- created_at
- updated_at
- deleted_at

Index:

- home_id, expense_date
- home_id, category_id
- home_id, deleted_at

## Renovation Domain

### renovations

Project รีโนเวทหรือปรับปรุงบ้าน

Fields:

- id
- home_id
- room_id nullable
- title
- description
- status
- budget_minor
- currency
- start_date
- end_date
- contractor_vendor_id nullable
- created_by
- created_at
- updated_at
- deleted_at

Index:

- home_id, status
- home_id, start_date

### renovation_milestones

Milestone ของ project

Fields:

- id
- renovation_id
- title
- due_date
- completed_at
- sort_order
- created_at
- updated_at

## Appliance and Asset Domain

### appliances

เครื่องใช้ไฟฟ้าและทรัพย์สินสำคัญ

Fields:

- id
- home_id
- room_id nullable
- name
- brand
- model
- serial_number
- category
- status
- purchase_date
- purchase_price_minor
- currency
- vendor_id nullable
- warranty_id nullable
- notes
- created_by
- created_at
- updated_at
- deleted_at

Index:

- home_id, room_id
- home_id, status
- home_id, warranty_id

## Document Domain

### documents

Metadata ของเอกสาร

Fields:

- id
- home_id
- title
- document_type
- description
- issue_date
- expiry_date
- storage_bucket
- storage_path
- file_name
- file_mime_type
- file_size_bytes
- uploaded_by
- created_at
- updated_at
- deleted_at

Index:

- home_id, document_type
- home_id, expiry_date

### document_links

เชื่อมเอกสารกับ entity อื่น

Fields:

- id
- document_id
- home_id
- entity_type เช่น expense, appliance, renovation, mortgage, maintenance
- entity_id
- created_at

Constraint:

- unique document_id, entity_type, entity_id

Note:

PostgreSQL ไม่สามารถ enforce foreign key แบบ polymorphic ได้โดยตรง จึงต้อง validate ที่ application layer หรือแยกเป็น link table ต่อ domain หากต้องการ strict integrity มากขึ้น

## Maintenance Domain

### maintenance_tasks

งานดูแลบ้าน

Fields:

- id
- home_id
- room_id nullable
- appliance_id nullable
- title
- description
- status
- priority
- due_date
- scheduled_date
- completed_at
- assigned_to nullable
- recurring_rule_id nullable
- created_by
- created_at
- updated_at
- deleted_at

Index:

- home_id, status
- home_id, due_date
- home_id, appliance_id

### recurring_rules

กฎสำหรับงานหรือค่าใช้จ่ายที่เกิดซ้ำ

Fields:

- id
- home_id
- rule_type เช่น maintenance, expense
- frequency เช่น weekly, monthly, quarterly, yearly
- interval
- start_date
- end_date
- next_occurrence_date
- last_generated_at
- is_active
- created_at
- updated_at

## Warranty Domain

### warranties

ข้อมูลรับประกัน

Fields:

- id
- home_id
- provider_name
- warranty_type
- start_date
- end_date
- coverage_notes
- contact_phone
- contact_email
- claim_url
- created_at
- updated_at
- deleted_at

Index:

- home_id, end_date

## Shopping Domain

### shopping_items

รายการของที่ต้องซื้อ

Fields:

- id
- home_id
- room_id nullable
- renovation_id nullable
- title
- description
- status
- priority
- estimated_price_minor
- actual_price_minor
- currency
- product_url
- vendor_id nullable
- target_purchase_date
- purchased_expense_id nullable
- created_by
- created_at
- updated_at
- deleted_at

## Mortgage Domain

### mortgages

ข้อมูลสินเชื่อบ้าน

Fields:

- id
- home_id
- lender_name
- loan_account_label
- principal_amount_minor
- currency
- annual_interest_rate
- term_months
- start_date
- payment_due_day
- notes
- created_at
- updated_at
- deleted_at

### mortgage_payments

ประวัติการจ่ายสินเชื่อ

Fields:

- id
- mortgage_id
- home_id
- payment_date
- amount_minor
- principal_minor nullable
- interest_minor nullable
- fee_minor nullable
- remaining_balance_minor nullable
- expense_id nullable
- notes
- created_at
- updated_at

Index:

- home_id, payment_date
- mortgage_id, payment_date

## Vendor Domain

### vendors

ร้านค้า ผู้รับเหมา หรือผู้ให้บริการ

Fields:

- id
- home_id
- name
- vendor_type เช่น store, contractor, service_provider, bank
- contact_name
- phone
- email
- website
- address
- notes
- created_at
- updated_at
- deleted_at

## Timeline Domain

### timeline_events

Event ประวัติบ้าน

Fields:

- id
- home_id
- event_type
- title
- description
- event_date
- source_type nullable
- source_id nullable
- room_id nullable
- created_by
- created_at
- updated_at
- deleted_at

Index:

- home_id, event_date
- home_id, event_type
- home_id, source_type, source_id

## Tags

### tags

Fields:

- id
- home_id
- name
- color
- created_at

### tag_links

Fields:

- id
- home_id
- tag_id
- entity_type
- entity_id
- created_at

## Relationships Summary

- home 1:N rooms
- home 1:N expenses
- home 1:N appliances
- home 1:N documents
- home 1:N maintenance_tasks
- home 1:N renovations
- home 1:N warranties
- home 1:N shopping_items
- home 1:N mortgages
- home 1:N timeline_events
- room 1:N appliances, expenses, maintenance_tasks, renovations
- appliance 1:N maintenance_tasks
- appliance 1:1 หรือ N:1 warranty ตาม implementation choice
- renovation 1:N expenses และ shopping_items
- mortgage 1:N mortgage_payments
- document N:N domain entities ผ่าน document_links

## Row Level Security Strategy

Phase 0 ยังไม่ใช้ RLS เพราะ auth ถูกตัดออกแล้ว

เมื่อเพิ่ม authentication กลับมาในเฟสหลัง ต้องเพิ่ม:

- profiles
- home_members
- owner/editor/viewer roles
- RLS policies ทุกตารางที่มีข้อมูลผู้ใช้
- checklist ทดสอบ owner, editor, viewer และ non-member

## Data Integrity Rules

- `amount_minor` ต้องมากกว่าหรือเท่ากับ 0
- `currency` ต้องเป็น ISO currency code
- `end_date` ต้องไม่ก่อน `start_date`
- status ต้องอยู่ในค่าที่กำหนด
- record ที่ link ข้าม domain ต้องอยู่ใน home เดียวกัน
- file metadata ต้องตรงกับ storage object ที่ upload สำเร็จ

## Migration Strategy

- Migration ต้องอยู่ใน version control
- ห้ามแก้ migration ที่ apply แล้วใน production
- ใช้ seed data เฉพาะ development
- แยก migration สำหรับ schema, policy และ seed
- เมื่อเพิ่ม RLS ต้องมี checklist ทดสอบ owner, editor, viewer และ non-member

## Backup and Export

ข้อมูลบ้านเป็นข้อมูลส่วนตัวระยะยาว ควรมีแผน:

- Export CSV สำหรับ expenses, appliances, maintenance
- Export metadata ของ documents
- Download document files แบบเป็นชุดในอนาคต
- Supabase backup สำหรับ production
