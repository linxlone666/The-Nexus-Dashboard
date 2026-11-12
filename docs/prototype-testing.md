# Test the combined dashboard prototype

Branch: feature/dashboard-prototype. Run npm run dev in I:\Homework\the-nexus-dashboard and open http://localhost:3000/login.

Start with superadmin@company.com / pass. Create the other accounts yourself in Users → Create User.

## Suggested test

1. Create a User with your own email and demo password.
2. Enable View Dashboard and Access Projects. Assign one project as Viewer and another as Editor. Save Permissions.
3. Sign out and sign in as that user. My projects should show only the assigned projects.
4. Confirm the Viewer project is read-only. Save a description on the Editor project, then refresh to check it persisted.
5. Sign in as Superadmin again. Remove that user's Access Projects permission and save. The user's project links and route access should disappear.
6. Create an Admin. Enable Manage Users to show its Users menu, and grant any other intended management permissions. Vendors and project creation remain Superadmin-only.
7. In General, set an account Inactive or Pending. That account should not be able to sign in.
8. Test a wrong password and a duplicate email.

Existing created users are retained. For an older account without a demo password, set one in Users → General and activate the account.

Read [accounts and permissions](accounts-and-permissions.md) for the code flow and storage fields. Accounts, credentials, and project edits use localStorage in this browser only.
