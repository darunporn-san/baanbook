# Style Guide

## Design Personality

BaanBook ควรรู้สึกเป็นระบบที่น่าเชื่อถือ สงบ และใช้งานได้ทุกวัน เป็นเครื่องมือส่วนตัวที่ช่วยให้บ้านเป็นระเบียบ ไม่ใช่แอปการเงินที่แข็งหรือ dashboard enterprise ที่เย็นเกินไป

Keywords:

- Calm
- Organized
- Trustworthy
- Domestic
- Practical
- Long-lived

## Visual Direction

### Layout

- ใช้พื้นที่อย่างประหยัด
- ให้ข้อมูล scan ง่าย
- ไม่ทำ hero section ใน app หลัง login
- ใช้ card สำหรับ widget หรือ repeated item เท่านั้น
- หลีกเลี่ยง card ซ้อน card
- ใช้ full-width section หรือ panel ที่มี hierarchy ชัดเจน

### Color

ควรใช้ palette ที่สมดุล ไม่ครอบด้วยสีเดียว

Suggested roles:

- Background: neutral light
- Surface: white หรือ neutral very light
- Primary: เขียวอมฟ้าหรือ blue-green ที่ให้ความรู้สึกบ้านและความปลอดภัย
- Accent: amber สำหรับ reminder หรือ due soon
- Destructive: red
- Success: green
- Info: blue
- Muted: gray

หลีกเลี่ยง:

- หน้าเกือบทั้งระบบเป็นม่วงหรือ gradient ม่วง
- beige/tan ทั้งหน้า
- dark slate ทั้งระบบโดยไม่มีเหตุผล
- decorative orb หรือ blob background

## Typography

- ใช้ font ที่อ่านง่าย
- Heading ใน app ควรสั้นและไม่ใหญ่เกินจำเป็น
- Table และ dense UI ใช้ขนาดตัวอักษรที่อ่านง่ายบน desktop
- ห้ามใช้ letter spacing ติดลบ
- ไม่ scale font ด้วย viewport width

## Spacing

แนวทาง spacing:

- Page padding desktop: 24px ถึง 32px
- Page padding mobile: 16px
- Section gap: 24px
- Widget gap: 16px
- Form field gap: 12px ถึง 16px
- Compact row height: 48px ถึง 64px

## Border Radius

- Card radius ไม่เกิน 8px เว้นแต่ design system กำหนดไว้
- Button radius ใช้ตาม shadcn/ui default
- Dialog/drawer radius ใช้สม่ำเสมอ

## Icons

ใช้ lucide icons ผ่าน shadcn/ui ecosystem เมื่อมี icon เหมาะสม

Examples:

- Home
- Receipt
- Wrench
- FileText
- ShieldCheck
- Clock
- ShoppingCart
- CreditCard
- Calendar
- Search
- Plus
- Upload
- Download

Icon-only button ต้องมี tooltip หรือ accessible label

## Component Tone

### Buttons

- Primary สำหรับ action สำคัญหนึ่งอย่างต่อหน้า
- Secondary สำหรับ action รอง
- Ghost สำหรับ toolbar และ low-emphasis action
- Destructive สำหรับ delete/archive ที่มีผลชัดเจน

### Badges

ใช้กับ:

- status
- priority
- warranty state
- due state
- document type

Badge text ต้องสั้น เช่น `Overdue`, `Due soon`, `Active`, `Expired`

### Cards

ใช้กับ:

- dashboard widget
- entity summary
- mobile list item

ไม่ใช้ card เพื่อห่อทั้ง page section หากไม่ได้จำเป็น

### Dialogs and Drawers

- Dialog เหมาะกับ action สั้น
- Drawer เหมาะกับ detail หรือ form ที่มีหลาย field
- Mobile ควรใช้ drawer เต็มความกว้าง

## Data Visualization

ใช้ chart เมื่อช่วยตอบคำถามจริง เช่น:

- ค่าใช้จ่ายตามเดือน
- ค่าใช้จ่ายตามหมวด
- renovation budget used
- mortgage balance trend

หลีกเลี่ยง chart ที่ไม่มี decision value

## Writing Style

### Tone

- สั้น
- ชัด
- ไม่เป็นทางการเกินไป
- ไม่ใช้ศัพท์เทคนิคกับผู้ใช้ทั่วไปถ้าไม่จำเป็น

### Labels

ใช้คำที่ผู้ใช้เข้าใจทันที:

- Add expense
- Upload document
- Complete task
- Warranty expires
- Convert to expense

### Error Messages

ควรบอกปัญหาและทางแก้:

- `Please enter an amount.`
- `This file is too large.`
- `You do not have permission to edit this home.`

ไม่ควรแสดง:

- raw SQL error
- stack trace
- internal table name

## Accessibility Standards

- Contrast ผ่าน WCAG AA สำหรับ text สำคัญ
- Form input ต้องมี label
- Focus ring ต้องมองเห็น
- Keyboard action ต้องครบสำหรับ dialog, menu, popover
- Icon-only button ต้องมี aria-label
- สี status ต้องมี text หรือ icon เสมอ

## Responsive Rules

- Navigation ต้องไม่บัง content บน mobile
- Table ต้องมี mobile alternative
- Button text ต้องไม่ล้น
- Filter controls บน mobile ควรอยู่ใน sheet/drawer
- Dashboard widget ต้องเรียงจากสำคัญมากไปน้อย

## Status Language

### Maintenance

- Todo
- Scheduled
- In progress
- Done
- Skipped
- Cancelled

### Renovation

- Planning
- Active
- Paused
- Completed
- Cancelled

### Warranty

- Active
- Due soon
- Expired

### Shopping

- Planned
- Bought
- Cancelled

