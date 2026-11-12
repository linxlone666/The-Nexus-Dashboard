# Data files

Create people through Users → Create User. The only seeded account is superadmin@company.com / pass. Existing browser-created users are preserved.

| File               | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| mock-accounts.ts   | The one bootstrap Superadmin and role names                   |
| users.ts           | The User type and safe table record for the bootstrap account |
| credential.ts      | Login helper; checks the shared user store                    |
| permissions.ts     | Permission labels, Access type, and empty access defaults     |
| projects.ts        | Starter project records                                       |
| vendors.ts         | Starter vendor records and sample sources                     |
| project-options.ts | Project setup choices                                         |
| overview.ts        | Management overview labels and shortcuts                      |
| dashboard.ts       | User dashboard sample readings                                |
| dashboards.ts      | Dashboard route descriptions                                  |
| settings.ts        | Default display settings                                      |
| audit.ts           | Audit category choices                                        |

Created accounts, demo passwords, status/role changes, and access assignments are stored under nexus-management-users. utils/user-store.ts is shared by login and the table, so creating an account makes it available to login immediately. Counts come from the actual registered accounts.

The credential entry stores the signed-in identity. utils/demo-session.ts resolves its email against the latest user records and permissions. Project assignments use stable project keys, with compatibility for older saved assignments that used names.

See [accounts and permissions](../docs/accounts-and-permissions.md) for the complete walkthrough. Use demo passwords only; this prototype stores them in browser localStorage.
