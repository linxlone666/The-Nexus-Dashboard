# Where the demo data lives

Start with `users.ts`. Each object is one table row. Its `User` type describes the fields that a user must have.

| File | What you can edit |
| --- | --- |
| `users.ts` | Starter users and the example user summary totals |
| `permissions.ts` | Permission choices, project access choices, and initial assignments |
| `projects.ts` | Starter projects and the organization list derived from them |
| `vendors.ts` | Starter vendors, sample endpoints, and their data sources |
| `project-options.ts` | Project setup steps, environments, owners, and source types |
| `overview.ts` | Different Admin and Superadmin overview content |
| `dashboard.ts` | User dashboard sample readings and summary figures |
| `dashboards.ts` | Choices on the dashboard selection page |
| `settings.ts` | Default display settings and time zone choices |
| `audit.ts` | Audit category choices |

## Follow one record onto the screen

1. `data/users.ts` exports `initialUsers`, an array of user objects.
2. `components/management/UserManagement.tsx` imports that array.
3. `getUsers()` combines the starter users with browser-saved users and role changes.
4. `users.filter(...)` selects rows that match the search and dropdowns.
5. `visible.map(...)` turns each matching user into a table row.

For example, changing a starter user's name in `users.ts` changes the name shown in the table. Keep email addresses unique because the current page uses email to identify users and their permissions.

## Data and behavior have different jobs

These files contain starting records and fixed choices. They have no React hooks, click handlers, or localStorage calls.

The components display the data and handle interaction. The existing storage helpers read and write localStorage. A saved browser edit can override a starter record, so changing a seed value does not erase saved edits.

The existing user summary numbers (124 users, for example) are illustrative totals, not counts of the eight sample rows. This refactor preserves them. Project, vendor, and integration totals continue to be calculated from the records at runtime.

Integrations come from projects and vendors, so there is no second integration seed list. Audit entries come from user actions, so there is no invented audit history.

Navigation rules, badge colors, and table headings stay with the UI. They describe how the page works or looks rather than sample business records.
