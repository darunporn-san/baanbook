# UI Architecture

## Product Experience

BaanBook ควรรู้สึกเหมือน operational tool ที่สงบ ใช้งานซ้ำได้ และค้นข้อมูลเร็ว ไม่ใช่ landing page หรือ dashboard ที่มีแต่กราฟสวย ๆ ผู้ใช้ควรเปิดมาแล้วตอบคำถามเกี่ยวกับบ้านได้ทันที

## App Structure

### Primary Navigation

- Dashboard
- Homes
- Expenses
- Renovation
- Appliances
- Documents
- Maintenance
- Warranty
- Timeline
- Shopping
- Mortgage
- Settings

ถ้าผู้ใช้มีบ้านเดียว navigation ควรเลือกบ้านให้อัตโนมัติ ถ้ามีหลายบ้านควรมี home switcher ด้านบนหรือใน sidebar

## Layout

### Desktop

- Sidebar ซ้ายสำหรับ navigation
- Header ด้านบนสำหรับ home switcher, search และ quick add
- Content area ตรงกลาง
- Optional right panel สำหรับ detail, filter หรือ upcoming reminders

### Mobile

- Bottom navigation หรือ compact menu สำหรับ section สำคัญ
- Home switcher อยู่บนสุด
- Quick add เข้าถึงง่าย
- Table ต้องแปลงเป็น list/card ที่ scan ได้

## Dashboard

Dashboard เป็นหน้าหลักของแอป

### Information Priority

1. Alerts ที่ต้องทำเร็ว เช่น overdue maintenance หรือ warranty ใกล้หมด
2. สรุปค่าใช้จ่ายเดือนนี้
3. งาน maintenance ที่กำลังจะถึง
4. Timeline ล่าสุด
5. Renovation หรือ mortgage snapshot
6. Shopping pending

### Widgets

- Expense Summary: เดือนนี้, เดือนก่อน, เทียบกับ average
- Upcoming Maintenance: due date, priority, linked item
- Expiring Warranty: item, expiry date, action
- Active Renovation: status, budget used
- Mortgage Snapshot: payment due, remaining balance
- Recent Timeline: event ล่าสุด
- Document Shortcuts: เอกสารล่าสุดหรือเอกสารใกล้หมดอายุ

## Global Quick Add

ควรมีปุ่ม quick add สำหรับ action ที่ใช้บ่อย:

- Add expense
- Add document
- Add maintenance
- Add appliance
- Add shopping item

Quick add ควรเปิด modal หรือ drawer ที่สั้น ไม่บังคับกรอก field ที่ไม่จำเป็น

## Search

Search ควรค้นจากหลาย domain:

- Expense title/vendor
- Appliance name/brand/model/serial
- Document title/type/tag
- Maintenance title
- Renovation title
- Timeline note

MVP อาจเริ่มจาก search ต่อหน้า feature ก่อน แล้วค่อยทำ global search ในภายหลัง

## Feature Pages

### Expenses

Views:

- Monthly list
- Category summary
- Calendar/month filter
- Detail drawer

Expected Controls:

- Date range
- Category filter
- Room filter
- Amount sort
- Export ในอนาคต

### Renovation

Views:

- Project list
- Project detail
- Budget summary
- Expense list within project
- Document list within project

Status:

- planning
- active
- paused
- completed
- cancelled

### Appliances

Views:

- Inventory list
- Room grouped view
- Detail page
- Warranty and maintenance history

Important UI:

- Warranty badge
- Status badge
- Serial/model copy button
- Linked documents

### Documents

Views:

- Document list
- Grid preview
- Type grouped view
- Detail drawer

Important UI:

- Upload dropzone
- File type icon
- Expiry indicator
- Linked entity chips
- Secure preview/download action

### Maintenance

Views:

- Upcoming list
- Status board
- Calendar view ในอนาคต
- Completed history

Important UI:

- Due date
- Priority
- Linked room/item
- Complete action
- Recurring indicator

### Renovation Room Card

ใช้ใน `/homes/[homeId]` เพื่อให้เจ้าของบ้านเห็นข้อมูลห้องที่จำเป็นต่อการ renovate ก่อนเข้าสู่ฟีเจอร์ renovation เต็มรูปแบบ

Views:

- Room list by selected home
- Room dimension summary
- Renovation estimate overview
- Openings count overview
- Opening size list

Important UI:

- Room name
- Floor
- Width x length x height
- Floor area estimate สำหรับงานพื้น
- Wall area estimate สำหรับงานสีหรือผนัง
- Volume สำหรับงานแอร์หรือการคำนวณพื้นที่เบื้องต้น
- Windows count
- Doors count
- Balconies count
- Opening type
- Opening label
- Opening width x height
- Opening quantity
- Delete opening action

ยังไม่ใช่ CRUD จริง:

- Edit opening detail
- Opening material
- Curtain or built-in measurement

### Warranty

Views:

- Active warranties
- Expiring soon
- Expired
- Claim info

Important UI:

- Days remaining
- Linked appliance/document
- Contact action

### Timeline

Views:

- Chronological feed
- Filter by type
- Filter by room/item
- Manual note composer

Timeline items ควรมี source link กลับไป record ต้นทาง

### Shopping

Views:

- Shopping list
- Wishlist
- Renovation shopping
- Purchased history

Important UI:

- Priority
- Estimated price
- Product URL
- Convert to expense

### Mortgage

Views:

- Loan summary
- Payment history
- Upcoming payment
- Document list

Important UI:

- Clear disclaimer ว่าเป็น tracking tool
- Editable payment data
- No hidden financial assumptions

## Empty States

Empty state ควรช่วยให้ผู้ใช้เริ่มทำสิ่งถัดไป ไม่ใช่อธิบายยาว

Examples:

- No expenses: ปุ่ม Add expense
- No appliances: ปุ่ม Add appliance
- No documents: ปุ่ม Upload document
- No maintenance: ปุ่ม Add maintenance task

## Loading States

- ใช้ skeleton สำหรับ list และ dashboard widgets
- ใช้ button loading เมื่อ submit form
- File upload ต้องมี progress หรืออย่างน้อยสถานะ uploading

## Error States

- Form error ใกล้ field
- Page-level error สำหรับโหลดข้อมูลไม่ได้
- Retry action เมื่อเหมาะสม
- ไม่แสดง raw Supabase error ให้ user

## Forms

หลักการ form:

- Required fields น้อยที่สุด
- Advanced fields ซ่อนได้
- Date และ amount ต้องกรอกง่ายบนมือถือ
- Currency default จาก home
- Room/entity link เป็น optional
- Upload เอกสารหลังสร้าง record ได้

## Tables and Lists

Desktop ใช้ table ได้เมื่อข้อมูลต้องเทียบหลาย column เช่น expenses และ mortgage payments

Mobile ควรใช้ compact list row:

- Title
- Secondary metadata
- Amount/status/date
- Quick action

## Accessibility

- Keyboard navigation ต้องใช้ได้
- Focus state ชัดเจน
- Form label ต้องครบ
- Icon-only button ต้องมี accessible label
- สี status ต้องมี text หรือ icon ประกอบ ไม่พึ่งสีอย่างเดียว
