# Create your own accounts and use their permissions

## Start here

Open http://localhost:3000/login. The only built-in account is:

- Email: superadmin@company.com
- Password: pass

The earlier sample User, Admin, and Manager logins and eight example user rows are no longer seeds. Users you previously created in this browser are preserved.

## Create an account

1. Sign in as Superadmin and open Users.
2. Click Create User.
3. Enter the person's name, email, demo password, and role.
4. Create the account. It starts Active with View Dashboard permission.
5. In Permissions, choose the allowed pages. Click Save Permissions.
6. For project access, also enable Access Projects, tick the desired projects, and select Viewer or Editor. Save again.
7. Sign out and sign in using the email and password you entered.

Creating an Admin does not automatically grant every management page. Enable Manage Users, Manage Integrations, View Audit Logs, or Manage Settings as needed.

In General, you can change a role, activate/deactivate an account, and set a new demo password. Leave the password blank to keep it. Inactive and Pending accounts cannot sign in. An older created user without a password needs one set here.

## What each permission does

| Permission          | Effect                                                         |
| ------------------- | -------------------------------------------------------------- |
| View Dashboard      | Opens the User operations dashboard or the management Overview |
| Access Projects     | Opens the project's page and makes assigned projects available |
| Manage Users        | Gives an Admin the Users menu and account-management actions   |
| Manage Integrations | Gives an Admin access to integrations for accessible projects  |
| View Audit Logs     | Gives an Admin the Audit Logs page                             |
| Manage Settings     | Gives an Admin the Settings page and allows saving preferences |
| Manage Vendors      | Reserved for Superadmin accounts                               |

A role sets the upper limit. A User can receive View Dashboard and Access Projects. An Admin can receive management permissions, except Vendors and project creation. Superadmin always has full access. Unavailable permission choices are disabled rather than pretending they will work.

Superadmin can grant management permissions. Admin can manage standard users and their basic access, and change User/Admin account roles. Admin cannot edit Superadmin accounts or grant project access above their own level. At least one active Superadmin must remain.

If an account has no allowed pages, it lands on No pages assigned yet and can still sign out. An account with Access Projects but no View Dashboard opens My projects directly.

## Viewer and Editor

- Viewer sees assigned projects and their descriptions, with no save control.
- Editor can also change and save the project description.
- An unassigned project does not appear in that account's project list.
- Superadmin sees every project and can create projects.

User accounts open My projects from their dashboard or navigation. Admin accounts use Projects. The same saved project descriptions appear in both views.

## How the code works

### 1. The form creates a shared user record

In components/management/UserManagement.tsx, addUser reads the form and calls createUser from utils/user-store.ts. That function validates the input and writes the account to the existing nexus-management-users localStorage entry.

The saved object contains:

| Field             | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| addedUsers        | Accounts created in the UI                       |
| passwordsByEmail  | Demo passwords keyed by account email            |
| rolesByEmail      | Saved role changes                               |
| statusesByEmail   | Active, Inactive, or Pending overrides           |
| accessByEmail     | Saved system permissions and project assignments |
| lastActiveByEmail | Last successful login date                       |

The table and login both read these records. They no longer use separate lists of people. User totals are calculated from these records too.

### 2. Login reads the same record

data/credential.ts finds the account through getUsers, checks its demo password and Active status, and returns a credential containing token, email, name, and role. Passwords are not included in this credential or in CSV exports.

components/Sign_In.tsx saves that credential under the credential localStorage key, then asks getSafeReturnPath which allowed page to open.

### 3. Permissions are checked in one helper

utils/permissions.ts contains the actual rules:

- hasPermission checks the role's limit and the saved checkbox.
- getProjectLevel checks Access Projects and the assignment for that project's key.
- canAccessDashboardPath checks whether the account can open a specific URL.
- getDashboardPath finds the first page the account can use.

For example, checking Access Projects alone does not assign every project. The account also needs a Viewer or Editor assignment for a project.

### 4. Menus, routes, and writes use those rules

AdminSuperadminLayout filters its links with hasPermission. UserNavbar does the same for the User dashboard and My projects.

DemoAccess checks the saved account before displaying a route. Typing a hidden page's URL does not show it; the user returns to an allowed page.

The save functions check again before writing. updateProjectDescription re-reads the current account and requires Editor. Changing the visible button alone cannot make the app's normal save handler accept a Viewer write.

### 5. Changes update an existing session

utils/demo-session.ts reads both credential and nexus-management-users. It looks up the current account by email, so an old role inside the saved credential does not override a role change.

Saving a user dispatches nexus-users-updated for the current tab. Other tabs receive the browser's storage event. Components read the latest permissions again, so revoking access removes menu items and blocks further writes. Deactivating the account returns its dashboard to login.

Project descriptions are saved separately under nexus-project-descriptions. The existing project, vendor, settings, and audit keys are retained.

## Prototype storage limits

Everything is stored in this browser profile at this site address and port. Another browser or computer will not have these created accounts. This is frontend demo authentication, not backend security. Demo passwords are stored in localStorage, so use sample passwords rather than real ones.
