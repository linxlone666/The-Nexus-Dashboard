# Test the combined dashboard prototype

Branch: feature/dashboard-prototype. It combines the latest main login with our dashboard-features branch.

Run npm run dev in I:\Homework\the-nexus-dashboard, then open http://localhost:3000/login.

| Account                | Password | Opens                |
| ---------------------- | -------- | -------------------- |
| user@company.com       | pass     | /dashboard           |
| admin@company.com      | pass     | /admin/overview      |
| superadmin@company.com | pass     | /superadmin/overview |

The older manager@company.com account also uses pass and opens the Admin view.

## Things to try

1. Sign in with each account and confirm the profile name and dashboard match.
2. Refresh a dashboard. The demo session should remain signed in.
3. As Admin, browse Users and Projects. Vendors and project creation are reserved for Superadmin.
4. As User, enter /admin/overview manually. The page should return to /dashboard.
5. As Superadmin, open Vendors and initialize a sample project. Review it in Projects and Integrations.
6. Use Sign out, then try opening a dashboard directly. It should open /login.
7. Enter a wrong password. It should report the error without saving a new session.

The session uses the existing credential localStorage key. Older sessions without a role require signing in again. Existing user edits, projects, vendor edits, settings, and audit entries keep their existing storage keys.

## Code to follow

- data/mock-accounts.ts: demo names, credentials, and roles.
- data/credential.ts: checks a mock account and returns its session.
- utils/demo-session.ts: saves/reads the session and selects a dashboard destination.
- components/Sign_In.tsx: signs in and redirects to the correct dashboard.
- components/DemoAccess.tsx: checks the saved role before showing a dashboard.
- app/admin/layout.tsx, app/superadmin/layout.tsx, app/dashboard/layout.tsx: apply that check to each route group.
- components/SignOutButton.tsx: clears the demo session and returns to login.

This is a frontend demonstration with browser storage. It has no backend authentication. The saved permission checkboxes remain sample assignments; they do not dynamically change login permissions. Dashboard access is based on the mock account role.
