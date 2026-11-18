# Nexus browser demo

The role, site, and system checks simulate permissions in the frontend. They use the signed-in demo account, its assigned site IDs, and its optional system list per site. Home uses the same permitted systems for monitoring records, dashboard tiles, and search. Real accounts and data require server-side authentication and authorization.

Dashboards are stored in this browser by account email and stable site ID. The first account and site that opens Home with an unscoped legacy layout adopts that layout. The old copy stays in browser storage. Project summaries from the old branch are read by project ID and keep their baseline site counts. Newly created sites have stable IDs and contribute to the project's count separately.

The site setup wizard checks sample data over the app’s mock REST endpoint. A custom REST base URL is validated and stored without contacting the external vendor. Use only dummy endpoints. Real vendor credentials belong in a server-side secret store.

Audit Logs show recent management mutations recorded in this browser. Each site creation or removal writes one entry.

## Dashboard devices

Home renders after device classification in the browser. Android and iOS phones and tablets use the mobile view, including iPad Safari with a desktop-style user agent and multitouch. Windows touch laptops use the desktop editor. Narrowing a desktop window keeps the desktop editor and its responsive layout.

Mobile displays the most recently saved dashboard for the signed-in account and selected site in this browser. Older saves without a timestamp use the first eligible dashboard in stored order. Mobile does not edit or rewrite layouts. Desktop and phone browsers on separate devices need shared persistence to sync.

## ทดสอบ Mock REST API

เปิด Superadmin → Sites → Add Site เลือก Nexus sample data แล้วไปที่ Connection configuration เลือกระบบและผลตอบกลับที่ต้องการ จากนั้นกด Test mock API หน้านี้ส่ง HTTP request ไปยัง API ของแอปจริง โดยปลายทางอ่านเฉพาะข้อมูลตัวอย่างจาก repo

ตัวอย่างปลายทาง GET /api/mock/monitoring?site=headquarters&system=cctv&scenario=success ค่า scenario ที่ใช้ได้คือ success, empty, unavailable และ malformed แหล่งข้อมูล Custom REST ตรวจรูปแบบ URL เท่านั้น

## ทดลองบน Vercel

รัน npm ci, npm run lint และ npm run build จากรากของ repo แล้ว import repo เข้า Vercel ด้วย Next.js preset สร้าง Preview Deployment จากสาขาฟีเจอร์ API ตัวอย่างไม่ต้องตั้ง environment variables เพิ่ม บัญชีเดโม สิทธิ์ และแดชบอร์ดยังคงแยกตามเบราว์เซอร์ แต่ละ Preview URL มี browser storage ของตัวเอง ใช้ข้อมูลตัวอย่างสำหรับทดสอบเท่านั้น
