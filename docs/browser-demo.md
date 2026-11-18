# Nexus browser demo

The role, site, and system checks simulate permissions in the frontend. They use the signed-in demo account, its assigned site IDs, and its optional system list per site. Home uses the same permitted systems for monitoring records, dashboard tiles, and search. Real accounts and data require server-side authentication and authorization.

Dashboards are stored in this browser by account email and stable site ID. The first account and site that opens Home with an unscoped legacy layout adopts that layout. The old copy stays in browser storage. Project summaries from the old branch are read by project ID and keep their baseline site counts. Newly created sites have stable IDs and contribute to the project's count separately.

The site setup wizard checks sample data over the app’s mock REST endpoint. A custom REST base URL is validated and stored without contacting the external vendor. Use only dummy endpoints. Real vendor credentials belong in a server-side secret store.

Audit Logs show recent management mutations recorded in this browser. Each site creation or removal writes one entry.

## Dashboard devices

Home renders after device classification in the browser. Phone user agents such as iPhone and Android Mobile use the view-only dashboard with the floating menu. Tablets, including iPad, and touch laptops use the desktop shell. Narrowing a desktop window keeps its responsive desktop layout. The separate Mobile UI demo uses the same phone check.

Mobile displays the most recently saved dashboard for the signed-in account and selected site in this browser. Older saves without a timestamp use the first eligible dashboard in stored order. Mobile does not edit or rewrite layouts. Desktop and phone browsers on separate devices need shared persistence to sync.

## ทดสอบ Mock REST API

เปิด Superadmin → Sites → Add Site เลือก Nexus sample data แล้วไปที่ Data mapping เปิด Optional sample API test เลือกระบบและผลตอบกลับที่ต้องการ จากนั้นกด Test mock API หน้านี้ส่ง HTTP request ไปยัง API ของแอปจริง โดยปลายทางอ่านเฉพาะข้อมูลตัวอย่างจาก repo

ตัวอย่างปลายทาง GET /api/mock/monitoring?site=headquarters&system=cctv&scenario=success ค่า scenario ที่ใช้ได้คือ success, empty, unavailable และ malformed แหล่งข้อมูล Custom REST ตรวจรูปแบบ URL เท่านั้น

## ทดลองบน Vercel

ใช้ Node.js 24.x และรันคำสั่งจากราก repo ที่มี package.json ใน Vercel เลือก Next.js preset และสร้าง Preview Deployment จาก branch feature/dashboard-rebuild

Mock Monitoring API ที่ /api/mock/monitoring ใช้งานได้โดยไม่ต้องตั้ง environment variables เพิ่ม ส่วน Demo Login บน Vercel Preview ต้องตั้ง NEXT_PUBLIC_NEXUS_DEMO=true ใน Preview environment ก่อน build ทุกครั้งที่เปลี่ยนค่านี้ต้อง build ใหม่ เพราะ Next.js ฝังค่า NEXT_PUBLIC_ ลงใน client bundle ระหว่าง build

ใน Production ให้ลบ NEXT_PUBLIC_NEXUS_DEMO หรือกำหนดเป็น false แล้ว build ใหม่ เพื่อปิดทางเข้าบัญชีเดโม

สำหรับการทดสอบ production build ใน PowerShell ให้รัน

```powershell
npm ci
npm run lint
$env:NEXT_PUBLIC_NEXUS_DEMO = "true"
npm run build
npm run start
```

เปิด /login?demo=user และ /login?demo=admin ในสองแท็บบน Preview URL เดียวกัน ระบบเก็บบัญชีและไซต์ที่เลือกใน sessionStorage แยกตามแท็บ รีเฟรชแล้วยังเป็นบัญชีเดิม และ logout ในแท็บหนึ่งไม่เปลี่ยนบัญชีของอีกแท็บ

สิทธิ์ไซต์ Audit Logs และ layout ใช้ localStorage ร่วมกันภายใน origin และ browser profile เดียวกัน การเปลี่ยนสิทธิ์จะแจ้งแท็บอื่นผ่าน storage event แต่ละ Preview URL มี storage ของตัวเอง

สอง browser profiles หรือสองอุปกรณ์เข้าใช้งานพร้อมกันได้ แต่สิทธิ์และ layout ที่บันทึกไว้ในเครื่องหนึ่งยังไม่ซิงก์ไปอีกเครื่อง การใช้ layout จาก desktop บนโทรศัพท์คนละเครื่องต้องเพิ่ม shared persistence ในอนาคต

ระบบนี้ใช้ mock data และตรวจสิทธิ์ใน frontend สำหรับการสาธิต
