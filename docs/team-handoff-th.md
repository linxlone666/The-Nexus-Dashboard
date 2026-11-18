# คู่มือแบ่งงานและอ่านโค้ด The Nexus Dashboard

| คน | รับผิดชอบ | หน้าและส่วนที่ต้องอธิบาย |
| --- | --- | --- |
| 1 — คุณ | **Superadmin และ Navbar** | ภาพรวม จัดการบัญชีและไซต์ บันทึกการเปลี่ยนแปลง ตั้งค่า เมนูเดสก์ท็อปและโทรศัพท์ |
| 2 | **Admin, Login และสิทธิ์** | เข้าสู่ระบบ เลือกไซต์ โปรไฟล์ จัดการสิทธิ์ User และตั้งค่าไซต์ที่ดูแล |
| 3 | **Workspace, ตัวแก้ไขแดชบอร์ด และไทล์** | สร้างแดชบอร์ด จัดกริด แก้ไทล์ เลือกรูปแบบข้อมูล ตั้งลำดับกล้อง และบันทึก |
| 4 | **Monitoring, Search และ Mock REST API** | ข้อมูลแต่ละระบบ ผลค้นหา รายละเอียดกล้อง API จำลอง และเนื้อหา Mobile UI demo |

“มีแล้ว” ในคู่มือนี้หมายถึงสิ่งที่โค้ดทำได้ในเดโม ส่วนเจ้าของงานคือผู้รับผิดชอบอธิบาย ทดสอบ และแก้ส่วนนั้นต่อจากนี้

## คนที่ 1 — คุณ: Superadmin และ Navbar

### ภาพรวมและบัญชี

| ฟังก์ชัน | ทำงานอย่างไร |
| --- | --- |
| [SuperadminLayout](../app/superadmin/layout.tsx) | ครอบทุกหน้าใน `/superadmin` เรียก `useDemoProfile()` เพื่อรอผลอ่านเซสชัน จากนั้นแสดงเนื้อหาเมื่อบทบาทเป็น Superadmin และส่งเมนูบทบาทเดียวกันให้ `ManagementNavbar` |
| [OverviewPage](../app/superadmin/OverviewPage.tsx) | อ่านไซต์ บัญชี และ Audit Logs จาก `useManagement()` คำนวณสรุปไซต์ Active, Onboarding และ integration ที่ตั้ง REST แล้วรอข้อมูล พร้อมลิงก์ไปดูไซต์นั้น |
| [UserManagement](../components/management/UserManagement.tsx) | หน้า Users ส่ง `manager="Superadmin"` มาให้คอมโพเนนต์ร่วม ค้นชื่อหรืออีเมลและกรองตามบทบาท สถานะ และไซต์ในหน่วยความจำ `siteCount()` นับไซต์ที่ Active ส่วน `openPanel()` เปิดแถวที่เลือกและกลับไปแท็บ General |
| [บันทึกหรือส่งออกบัญชี](../components/management/UserManagement.tsx) | ฟอร์มอ่านค่าจาก `FormData` แยกไซต์ที่ติ๊กเป็น `siteIds` และระบบที่อนุญาตเป็น `systemsBySite` แล้วเรียก `saveAccount()` ส่วน `exportUsers()` สร้าง CSV จากแถวที่เลือกหรือผลกรองและเปิดดาวน์โหลดผ่าน Blob |
| [saveAccount](../utils/management-store.ts) | ตรวจชื่อ อีเมล บทบาท อีเมลซ้ำ และการแก้บัญชี Superadmin หลัก แล้วอัปเดตหรือเพิ่มบัญชีใน store ตรวจบทบาทผู้แก้ว่าเป็น Superadmin แล้วเซฟพร้อม Audit Log รหัสผ่านเว้นว่างได้ตอนแก้บัญชีเดิมเพื่อเก็บรหัสเดิม |

### Sites, Initialize Site และ Audit Logs

1. **เลือกไซต์** — `SiteDirectory` อ่านไซต์จาก `useManagement()` แล้วกรองชื่อหรือสถานที่ `selectSite()` เก็บ ID ของแถวที่เลือก ส่วน `subscribeHash()` ฟังการเปลี่ยน URL รูปแบบ `#site-…` เพื่อเปิดรายละเอียดจากลิงก์ได้หลังรีโหลด
2. **เริ่มสร้างไซต์** — `InitializeSite` ใช้ Details → Vendor → Data mapping → Review สำหรับ Sample และเพิ่มขั้น Connection สำหรับ Custom REST แต่ละขั้นเก็บค่าฟอร์มใน React state และ `goTo()` สลับขั้น จึงกดย้อนกลับแล้วอ่านค่าที่เคยกรอกได้
3. **ทดสอบการเชื่อมต่อ** — `testConnection()` เรียก `checkMockRest()` เมื่อเลือก Sample แล้วแสดง HTTP status และจำนวน readings หากเลือก Custom REST จะใช้ `validEndpoint()` ตรวจ URL เท่านั้น `resetConnection()` ล้างผลเทสต์เมื่อเปลี่ยนค่าที่เกี่ยวข้อง พร้อมเพิ่มเลขคำขอเพื่อทิ้งผลตอบกลับเก่าที่มาช้า
4. **บันทึกไซต์** — `submit()` ตรวจข้อมูลก่อนเลื่อนไปขั้นต่อไป ที่ Review จะสร้าง UUID แล้วเรียก `saveSite()` ตัว store ตรวจบทบาท Superadmin และชื่อไซต์ซ้ำก่อนบันทึกและเพิ่ม Audit Log จากนั้นเปิดรายละเอียดไซต์ผ่าน URL ไซต์ใหม่ใช้รหัสของตัวเองและถูกนับใต้ Nexus Operations สำหรับ Overview รุ่นเดิม
5. **ลบไซต์** — `removeSite()` ตรวจผู้ใช้ปัจจุบันและชื่อที่พิมพ์ยืนยัน ลบเฉพาะไซต์ตาม ID และล้าง ID นั้นออกจากสิทธิ์ของบัญชี แล้วเขียน Audit Log ส่วนนับภาพรวมจะเปลี่ยนตามข้อมูลที่อ่านใหม่
6. **ตั้งค่าและอ่านประวัติ** — `saveSettings()` ตรวจค่า Table density และ Time zone ก่อนบันทึก หน้า Audit Logs ค้นข้อความจาก action และ target กรอง Category, Event และ User พร้อมกันได้ แล้วจัดรูปแบบวันเวลาตาม timezone ที่กำหนด รายการมาจากการเปลี่ยนข้อมูลที่ store บันทึกไว้

ไฟล์ต้นทาง [SiteDirectory](../app/superadmin/sites/SiteDirectory.tsx) · [InitializeSite](../app/superadmin/sites/InitializeSite.tsx) · [management-store](../utils/management-store.ts) · [project-storage](../utils/project-storage.ts) · [Audit Logs](../app/superadmin/audit-logs/page.tsx) · [Settings](../app/superadmin/settings/page.tsx)

### Navbar ทั้งเดสก์ท็อปและโทรศัพท์

| ส่วน | ทำงานอย่างไร |
| --- | --- |
| [ManagementNavbar](../components/Admin-SuperAdmin/ManagementNavbar.tsx) | ใช้รายการเมนูตามบทบาทชุดเดียวกับโปรไฟล์และเมนูโทรศัพท์จาก [managementLinks](../components/management/navigation.ts) ใช้ `usePathname()` ไฮไลต์หน้าปัจจุบัน ลิงก์ Site dashboard พาไป `/home` เมื่อมีไซต์ที่ยังเข้าถึงได้ หรือพาไปเลือกไซต์ |
| [TopBar](../components/TopBar.tsx) และ [ProfileMenu](../components/ProfileMenu.tsx) | TopBar ประกอบชื่อไซต์ ชื่อแดชบอร์ด ช่องค้นหา และโปรไฟล์ตาม props ที่ได้รับ เมนูโปรไฟล์อ่านบัญชีจากเซสชัน ปิดเมื่อคลิกข้างนอกหรือกด Escape และ `signOut()` ล้างเซสชันแล้วพาไป `/login` |
| [useSidebarNavigation](../utils/sidebar-state.ts) | `togglePinned()` เปลี่ยนสถานะย่อหรือปักเมนู ค่าเก็บที่ `nexus-sidebar-collapsed` เมื่อเมาส์เข้ารางเดสก์ท็อปที่ย่ออยู่จะเริ่มจับเวลา 500 ms ออกจากรางจะยกเลิกหรือปิดตัวอย่าง กด Escape ปิดแล้วคืนโฟกัสที่ปุ่ม |
| [เมนูโทรศัพท์ใน Home](../app/home/view.tsx) | เมื่อ `useDashboardDevice()` คืน `mobile` หน้า Home ใช้ปุ่ม ☰ มุมขวาล่าง `mobileMenuOpen` คุมแผง Workspace, Monitoring, Search, โปรไฟล์และเปลี่ยนไซต์ เมื่อเลือก Monitoring เมนูปิดแล้วโฟกัสไปเนื้อหา |
| [BottomNavigation](../components/mobile-ui/BottomNavigation.tsx) และ [PhonePreview](../components/mobile-ui/PhonePreview.tsx) | ชุดเดโม `/mobile-ui` ใช้ลิงก์ Overview, Activity, CCTV, Alarms และ Site dashboard ปุ่ม ☰ สลับแผงด้วย state และตรวจเส้นทางด้วย `usePathname()` ส่วน PhonePreview รอให้รู้ประเภทอุปกรณ์แล้วแสดงเดโมเฉพาะโทรศัพท์ |

**ตอนเดโม** สร้างไซต์ด้วย Sample → Mapping → เปิดรายละเอียดหลังรีโหลด → ดู Audit Logs แล้วสลับทดสอบ Sidebar แบบ hover และปุ่ม ☰ แบบโทรศัพท์

**ตรวจเมนูของแต่ละบทบาท** — เปิด User, Admin และ Superadmin แล้วดู badge หลังชื่อใน Top Bar เมนู Profile ใช้สำหรับเลือกคำสั่ง ส่วนข้อมูลบัญชีเต็มอยู่ใน My profile ตัวเลือกไซต์ใน Home ใช้ native select และอ่านเฉพาะไซต์ที่บัญชีได้รับสิทธิ์

## คนที่ 2 — Admin, Login และสิทธิ์

| ฟังก์ชัน | ทำงานอย่างไร |
| --- | --- |
| [handleLogin](../app/login/Sign_In.tsx) และ [login](../data/credential.ts) | อ่านอีเมลและรหัสผ่านจากฟอร์ม ตรวจว่าบัญชี Active และรหัสผ่านตรง ค่อยสุ่มผลสำเร็จ ลิงก์หมดอายุ หรือเข้าไม่ได้ในเดโม เมื่อสำเร็จส่ง Superadmin ไปหน้าจัดการ ส่วน Admin และ User ไปเลือกไซต์ |
| [เซสชันและโปรไฟล์](../utils/demo-session.ts) | `saveDemoSession()` ล้างไซต์จากเซสชันก่อน เก็บอีเมลและ token เดโมใน sessionStorage ที่คีย์ `credential` และบันทึกเวลาเข้าสู่ระบบ `readDemoProfile()` อ่านบัญชีปัจจุบันจาก store ใหม่ จึงเห็นสิทธิ์และสถานะล่าสุด `signOutDemoSession()` ล้างเซสชันกับไซต์ที่เลือก |
| [chooseSite](../app/login/sites/page.tsx) | เรียก `availableSites()` จากข้อมูลล่าสุด ตรวจไซต์ Active และสิทธิ์ของบัญชีอีกครั้งก่อนเซฟ `selectWorkSite()` เก็บ ID ที่ `nexus-selected-site` แล้วนำไป Workspace |
| [AdminLayout](../app/admin/layout.tsx) และ [Users](../app/admin/users/page.tsx) | Layout ตรวจบทบาท Admin หน้า Users ส่ง `manager="Admin"` เข้า UI เดียวกับ Superadmin และจำกัดหน้าจอให้แก้สิทธิ์ของบัญชี User ในไซต์ที่ Admin ดูแล |
| [saveStandardUserAccess](../utils/management-store.ts) | ตรวจผู้แก้ว่าเป็น Admin และบัญชีเป้าหมายเป็น User ปฏิเสธไซต์นอกขอบเขตและระบบที่ไซต์นั้นไม่ได้ตั้งไว้ บันทึก `siteIds` และ `systemsBySite` โดยเก็บสิทธิ์นอกขอบเขตของ Admin คนนี้ไว้ |
| [Admin Sites](../app/admin/projects/page.tsx) และ [saveSitePreferences](../utils/management-store.ts) | ใช้หน้า Site Directory ร่วมกัน กรองเฉพาะไซต์ที่ได้รับมอบหมาย แล้วเซฟได้เฉพาะชื่อและ timezone ส่วนสร้างและลบไซต์เป็นงาน Superadmin |
| [ProfilePage](../app/profile/page.tsx) | แสดงข้อมูลบัญชี บทบาท และรายชื่อไซต์ที่เข้าถึงได้จากเซสชันและ store มีลิงก์กลับไปแดชบอร์ดไซต์หรือเลือกไซต์เมื่อยังไม่มีไซต์ |

**สิทธิ์ไหลไปถึง Home อย่างไร** — `siteIds` กำหนดว่าเข้าไซต์ได้หรือไม่ เมื่ออยู่ในไซต์ที่เข้าได้ Home ใช้ `systemsBySite[siteId]` จำกัดระบบ ถ้าไม่มีรายการ ระบบที่ไซต์เปิดไว้ใช้ได้ตามค่าเริ่มต้น ถ้าเป็นอาร์เรย์ว่างจะไม่มีระบบให้ดู รายการระบบเดียวกันถูกส่งให้ Monitoring, Search และตัวเลือกไทล์

**งานต่อและเดโม** — หน้า [Admin Overview](../app/admin/AdminOverview.tsx) สรุปไซต์และผู้ใช้ในขอบเขตของ Admin และมีทางเข้า Dashboard ให้เดโมตั้งสิทธิ์ CCTV ต่างกันสำหรับ User สองคนในไซต์เดียวกัน แล้วถอนสิทธิ์ไซต์หนึ่งและรีโหลดเพื่อตรวจผล

**เซสชันและโปรไฟล์** — DemoEntry เปิดบัญชีจาก /login?demo=user, /login?demo=admin หรือ /login?demo=superadmin เมื่อโหมดเดโมเปิดอยู่ บัญชีและไซต์ที่เลือกเก็บใน sessionStorage รายแท็บ สิทธิ์ Audit Logs และขนาดตัวอักษรอ่านจาก localStorage โดยขนาดตัวอักษรแยกตามบัญชี หน้า My profile แสดง Recent activity ของบัญชีตามขอบเขตไซต์ Reset Password ครั้งแรกบันทึกเพียงสถานะว่าตั้งเสร็จแล้ว

## คนที่ 3 — Workspace, ตัวแก้ไขแดชบอร์ด และไทล์

| ฟังก์ชัน | ทำงานอย่างไร |
| --- | --- |
| [NexusDashboardPage และ Workspace](../app/home/view.tsx) | ตรวจบัญชีและไซต์ที่เลือก แล้วสร้าง scope จากอีเมลกับ site ID `startDashboard()` เริ่มฉบับร่างว่าง `selectDashboard()` เปิดรายการที่เลือก `saveDashboard()` ตรวจชื่อ กรองไทล์ตามสิทธิ์ แล้วเลือกเพิ่มหรืออัปเดต `removeDashboard()` ขอคำยืนยันก่อนลบ |
| [DashboardGrid](../app/home/DashboardGrid.tsx) | ปุ่ม Add tile เลือก System → Data source → Display ตัวเลือก Display มาจากแหล่งข้อมูลที่เลือก และ Preview ใช้ตัวเรนเดอร์เดียวกับไทล์จริง `changeGrid()` เปลี่ยนจำนวนแถวและคอลัมน์โดยตรวจว่าจัดวางได้ |
| [การลากและปรับขนาด](../app/home/DashboardGrid.tsx) | `startDrag()` เก็บพิกัดและขนาดเซลล์ `draftFromPointer()` แปลงระยะลากเป็นจำนวนแถวและคอลัมน์แล้วคำนวณรูปทรงใหม่ กรอบตัวอย่างแสดงตำแหน่งที่วางได้ เมื่อปล่อยเมาส์ `applyLayout()` ใช้ผลกับฉบับร่าง ปุ่มลูกศรทำงานกับด้ามจับที่โฟกัส |
| [Tile Settings และการลบ](../app/home/DashboardGrid.tsx) | เฟืองเปิด dialog พร้อมสำเนาค่าเดิม เปลี่ยนข้อมูล รูปแบบ หรือขนาด แล้วกด Apply settings เพื่ออัปเดตฉบับร่าง Cancel ทิ้งค่าที่ลองแก้ ปุ่มลบเก็บกริดเดิมไว้ให้ Undo removal จนกว่าจะมีการแก้กริดครั้งถัดไป |
| [dashboard-layout](../app/home/dashboard-layout.ts) | `placeTiles()` ตรวจตำแหน่งให้พอดี Auto fill เรียงตาม order ส่วน Free placement ใช้พิกัดที่กำหนด `moveTile()`, `resizeTile()` และ `updateTile()` คืนเลย์เอาต์ที่ใช้ได้ `normalizeDashboardLayout()` จัดเลย์เอาต์รุ่นเก่าที่เกินสี่คอลัมน์ใหม่ |
| [CameraTileOrder](../app/home/CameraTileOrder.tsx) | ใช้กล้องของไซต์เป็นรายการให้เลือก ปุ่มขึ้นลงสลับ ID สองตัว ปุ่มลบเอา ID ออกจากไทล์ ตัวเลือก Add camera คืนกล้องที่เหลือเข้าไป ค่าที่เซฟคือรายการ `cameraIds` ตามลำดับนั้น |
| [tileSources และตัวเรนเดอร์](../app/home/tile-displays.ts) | `tileSources()` กำหนดรูปแบบตามชนิดข้อมูล เช่น Metric ใช้ Summary หรือ Line, Records ใช้ Table และชุด OHLC ใช้ Candlestick `resolveTileDisplay()` เลือกค่าเริ่มต้นที่รองรับถ้าค่าที่มีอยู่ใช้ไม่ได้ |
| [SystemTile](../app/home/SystemTile.tsx), [TileVisualization](../app/home/TileVisualization.tsx) และ [CSS](../app/home/overview.css) | SystemTile จัดหัวข้อ ค่าหลัก และทางเข้า Monitoring จากนั้น TileVisualization เรนเดอร์รูปแบบที่เลือก CSS วัดขนาดไทล์และพื้นที่เนื้อหาเพื่อแสดงจำนวนแถว รายละเอียด และขนาดกราฟให้เหมาะ |
| [saved-dashboards](../app/home/saved-dashboards.ts) | `dashboardScope()` สร้างคีย์จากอีเมลและไซต์ `useSavedDashboards()` อ่าน layout และฟังการเปลี่ยน storage `addDashboard()` กับ `updateDashboard()` เซฟเวลาไว้เพื่อให้โทรศัพท์เปิดรายการล่าสุด |
| [dashboard-device](../app/home/dashboard-device.ts) และ [DashboardAiBuilder](../app/home/DashboardAiBuilder.tsx) | ตรวจจาก User-Agent ของโทรศัพท์ โหมดนี้อ่าน layout แบบคอลัมน์เดียวและปิดการบันทึกหรือแก้ไข Build with AI เทียบคำสำคัญกับรายการไทล์ที่ได้รับอนุญาตในเดโม |

**ตอนเดโม** — เพิ่มกล้องสองตัว สลับลำดับ ย้ายและปรับขนาดไทล์ กด Apply settings แล้ว Save changes รีโหลดเช็กผล แล้วลองเปิดจากโหมดจำลองโทรศัพท์ในเบราว์เซอร์เดียวกัน

**ตรวจ Preview และการปรับขนาด** — DashboardGrid ใช้ renderer เดียวกันกับ Settings Preview และ Tile จริง กราฟเส้นและแท่งอยู่ใน TileChart ส่วนโดนัทอยู่ใน TileDonut ตัวเลขและหน่วยมาจาก mock รายวัน กริด desktop ตั้งได้สูงสุด 4 คอลัมน์ มือถืออ่าน layout ที่บันทึกไว้ในเบราว์เซอร์และจัดเป็นคอลัมน์เดียว

## คนที่ 4 — Monitoring, Search และ Mock REST API

| ฟังก์ชัน | ทำงานอย่างไร |
| --- | --- |
| [WorkspaceSearch](../app/home/WorkspaceSearch.tsx) | รับรายการระบบที่อนุญาตจาก Home สร้างผลค้นจากชื่อระบบ ชื่อกล้อง เหตุการณ์ และรายการในระบบนั้น กรองตามคำค้น แล้วใช้ `select()` ส่งรหัสระบบให้ `openMonitoring()` รองรับลูกศร Enter และ Escape |
| [MonitoringView](../app/home/MonitoringView.tsx) | อ่าน dataset สำหรับไซต์และระบบที่เปิด แสดงสรุปและรายละเอียดตาม Sample day ที่เลือกในช่วง 9–11 พฤศจิกายน 2026 พร้อมตารางย้อนหลัง Finance มีชุดราคา OHLC เพิ่ม ถ้าข้อมูลไซต์ว่างจะแสดงสถานะของข้อมูล |
| [CameraMonitoring](../app/home/CameraMonitoring.tsx) | `getCameraMonitoring()` คืนกล้องและเหตุการณ์ที่ใช้ camera ID เดียวกัน เมื่อเลือกกล้องจะกรองเหตุการณ์ของ ID นั้น และกด Show all cameras เพื่อคืนรายการทั้งหมด |
| [mock-system-data](../data/mock-system-data.ts) | `siteDataset()` แปลง mock ตัวเลขตามไซต์เป็น metrics และ readings ตามวันที่ `getManagedSiteSystems()` เลือกระบบที่ไซต์เปิดไว้ `getManagedSiteDataset()` อ่านข้อมูลจากไซต์ตั้งต้นหรือไซต์ Sample ที่ผูกไว้ |
| [mock-monitoring-records](../data/mock-monitoring-records.ts) | `getMonitoringRecords()` สร้างคอลัมน์และแถวต่างกันตามระบบ `getCameraMonitoring()` คืนชื่อ รหัสและสถานะกล้องพร้อมเหตุการณ์ `getPortfolioPrices()` คืน Open, High, Low, Close ตามวันที่ของ Finance |
| [Route Handler GET](../app/api/mock/monitoring/route.ts) | รับ `site`, `system`, `scenario` จาก query เลือก dataset แล้วคืน JSON จากไฟล์ใน repo `success` คืนข้อมูลตัวอย่าง, `empty` คืน rows ว่าง, `unavailable` คืน 503, `malformed` คืน 200 พร้อมรูปแบบผิด หากไม่รู้จักไซต์/ระบบจะคืน 404 และ scenario ที่ไม่รองรับจะคืน 400 |
| [checkMockRest](../utils/mock-rest.ts) | ฝั่งเบราว์เซอร์ใช้ `fetch()` เรียก API เดียวกับแอปจากหน้า Initialize Site มี timeout ตรวจ HTTP status, รหัสไซต์และระบบ, รายการ metric และรูปแบบ readings ก่อนคืนจำนวนแถวให้หน้าทดสอบ |
| [MobileDashboard](../components/mobile-ui/MobileDashboard.tsx) | เลือกคอมโพเนนต์ Overview, Activity, CCTV หรือ Alarms จากค่า `screen` ของแต่ละ route หน้าชุดนี้ใช้ข้อมูลระบบเดียวกับ Home ผ่าน MobileSystemView และ MobileCctv และตรวจสิทธิ์ไซต์ก่อนแสดงข้อมูล ส่วน BottomNavigation และเงื่อนไขเข้าจากโทรศัพท์อยู่ในงานคนที่ 1 |

**ตอนเดโม** — ค้นชื่อกล้องแล้วกด Enter สลับกล้องใน CCTV เพื่อดูเหตุการณ์เฉพาะเครื่อง จากนั้นเปิด Mock API ผ่านตัวช่วยตั้งค่าไซต์ ทดลองทั้งผลปกติ ข้อมูลว่าง 503 และ schema ผิด

**ตรวจยอดรายวัน** — ตารางเหตุการณ์และยอดของ CCTV, Alarms, Attendance, Visitors, CRM และ Access ใช้รายการจำลองร่วมกัน ส่วนข้อมูลที่เป็นค่ารายวันอย่าง kWh อ่านจาก readings ของวันนั้น Search เปิดผลไปที่วันของรายการ Mock REST ยังรองรับกรณีข้อมูลว่าง 503 และข้อมูลผิดรูปแบบ

## จุดส่งต่องาน

- **1 กับ 2** ใช้ UserManagement, SiteDirectory และ management-store ร่วมกัน คนที่ 1 ดูแลส่วน Superadmin และส่วนประกอบ Navbar คนที่ 2 ตรวจการจำกัดสิทธิ์ของ Admin และข้อมูลที่ Login ใช้
- **2 กับ 4** คนที่ 2 ดูแลค่าที่บันทึกใน `siteIds` และ `systemsBySite` คนที่ 4 ตรวจว่าระบบที่ถูกถอนไม่โผล่ใน Search หรือ Monitoring
- **3 กับ 4** คนที่ 3 ดูแลกริด การตั้งค่าไทล์ และหน้าตาของข้อมูลบนไทล์ คนที่ 4 ดูแลแหล่งข้อมูล ข้อมูลจำลอง และความหมายของ metric หรือ record
- **1 กับ 3** คนที่ 1 ดูแลเมนูและทางเข้า Workspace คนที่ 3 ดูแลการเลือกและการบันทึกแดชบอร์ดใน Workspace

ข้อมูลบัญชี สิทธิ์ ไซต์ Audit Logs และ layout อยู่ใน browser storage ของเดโม การแยกบทบาทจำลองที่ฝั่งหน้าเว็บ การซิงก์ข้ามเครื่องและการใช้ข้อมูลจริงต้องใช้ระบบจัดเก็บร่วมกับการตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ Mock API ส่ง HTTP จริงจากเบราว์เซอร์ไปยัง Route Handler ของแอป แต่คืนข้อมูลตัวอย่างและใช้กับตัวทดสอบการเชื่อมต่อ ส่วนหน้าไทล์และ Monitoring อ่านชุดข้อมูลตัวอย่างในโปรเจกต์โดยตรง อ่านวิธีทดสอบเพิ่มเติมใน [คู่มือเดโม](browser-demo.md)
