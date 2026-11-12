# Nexus prototype code walkthrough

Run npm run dev and open http://localhost:3000/login. Start with superadmin@company.com / pass, then create your own accounts in Users.

Read [accounts and permissions](docs/accounts-and-permissions.md) for how creation, login, saved permissions, and project access connect. Follow [prototype testing](docs/prototype-testing.md) to try the complete flow.

## Search and tables

UserManagement.tsx keeps the search text and dropdown choices in React state. It calls users.filter to select matching records, then visible.map to display table rows. The top-bar search and table search share the same query.

Projects, vendors, integrations, and audit history use the same filter/map pattern. UserNavbar filters navigation choices that the current account is allowed to open.

TailGrids supplies Input, Button, and Badge. The management tables use ordinary HTML table elements. Page components supply their data and click handlers.

## Browser storage

utils/user-store.ts reads and saves the shared account records. Saving dispatches nexus-users-updated so the table, session, and menus read the new values. The browser storage event updates other tabs.

components/management/project-storage.ts combines starter projects with created projects and saved descriptions. useAccessibleProjects filters the result to the signed-in account's assignments. Save actions recheck permissions before writing.

Vendor changes, display preferences, and audit events retain their existing storage helpers. There is no backend; data belongs to this browser profile and site address.
