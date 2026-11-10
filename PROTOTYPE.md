# Nexus prototype code walkthrough

Run `npm run dev` and open the URL printed by Next.js. Choose User, Admin, or Superadmin from the homepage. Use **Switch dashboard** to return to the dashboard list.

This branch combines the User navigation and the working Admin and Superadmin dashboards, with browser storage for management changes.

Search fields and management forms use the shared TailGrids `Input` and `Button`. Status labels use its `Badge`. Each page still supplies the handlers that search, submit, and save data.

## How user search works

Follow the search in [UserManagement.tsx](components/management/UserManagement.tsx#L124).

| Line | What it does |
| --- | --- |
| 124 | `useState("")` starts the search with an empty query. `setQuery` updates it and triggers a render. |
| 271 | `value={query}` displays the current query. `onChange` reads what you typed from `event.target.value` and calls `setQuery`. |
| 241 | The top bar gets the same query and setter. Typing in either search box updates both inputs. |
| 141 | `users.filter(...)` runs the checks below for every user. It returns a new list of rows that pass. |
| 142 | The template string joins the name and email. `trim()` removes spaces at the ends of the query, and `toLowerCase()` makes both sides lowercase. `includes(...)` checks for a partial match. Typing `  MARIA ` matches Maria Garcia. An empty query matches any string. |
| 143 | The role check passes when the dropdown is **All** or the role matches. |
| 144 | The status check works the same way. |
| 145 | The project access check treats a count above zero as assigned and zero as unassigned. |
| 294 | `visible.map(...)` turns the filtered list into table rows. The `&&` operators above require each filter to pass. |

Projects, vendors, integrations, and audit logs use the same `filter` pattern with their own fields. The [User navbar](components/UserNavbar.tsx#L50) filters navigation labels. When you press Enter, it sets the URL fragment to the first matching section, such as `#cctv`, and the browser jumps there.

## How local storage works

Browser `localStorage` stores strings. The app writes records as JSON and reads them back after refresh. Data belongs to a browser profile and a site URL, including the port. Switching roles at the same URL keeps the records available.

Follow the save and reload path in [UserManagement.tsx](components/management/UserManagement.tsx#L60).

| Line | What it does |
| --- | --- |
| 60 | `storageKey` names the entry in browser storage. |
| 65 | `getItem` reads the saved JSON. `?? ""` supplies an empty value on first visit. |
| 74 | `JSON.parse` converts the string to a JavaScript object. The reader falls back to empty saved records when it cannot read the data. |
| 90–99 | The component listens for changes from other tabs through the `storage` event and for its own writes through `nexus-users-updated`. |
| 104 | `JSON.stringify(saved)` converts the added users, role changes, and permission overrides to JSON. `setItem` writes that string. |
| 108 | `dispatchEvent` tells components in the current tab to read the new value. |
| 121–123 | `useSyncExternalStore` connects React to storage. React combines the existing starter rows with the saved additions and applies role changes each time the data changes. |

## How the other actions work

- **Add User.** In [UserManagement.tsx](components/management/UserManagement.tsx#L181), lines 182–185 read and normalize the form. Lines 187–195 validate the name and check the latest saved records for duplicates. Lines 196–199 create a pending user. Lines 200–203 save the updated list or display an error. Lines 204–214 log the action, show the new user, and close the form.
- **Edit a role.** In [UserManagement.tsx](components/management/UserManagement.tsx#L159), the form submits a User or Admin choice. Lines 163–165 re-read storage and find the latest record. Lines 167–171 save the new role under that email. The table and details read the same updated record, and the handler logs the change.
- **Checkboxes and permissions.** [UserManagement.tsx](components/management/UserManagement.tsx#L287) uses `checked` as a list of selected email addresses for the table and CSV export. Clicking a row checkbox adds or removes that address. Permission checkboxes update a separate draft at line 357. The Save Permissions handler at line 389 writes that draft under the selected user's email and then records an audit event. Refreshing before Save discards the draft.
- **Initialize a project.** [InitializeProject.tsx](components/management/InitializeProject.tsx#L84) checks the name and key, vendor, demo connection, and data mappings in that order. Each valid step advances the wizard. On the last step, line 108 builds the project and calls `saveProject`. [project-storage.ts](components/management/project-storage.ts#L65) reads existing projects, checks for duplicate keys, writes the new list, and notifies the table to refresh. The wizard then records an audit entry and opens Projects.
- **Vendors.** [VendorManagement.tsx](components/management/VendorManagement.tsx#L58) reads the form and validates the endpoint before building a vendor record. [vendor-catalog.ts](components/management/vendor-catalog.ts#L98) checks for duplicate names and replaces the saved row with the matching ID. The connection test checks the endpoint format and credential reference locally and records a simulated result.
- **Settings and audit logs.** [ManagementSettings.tsx](components/management/ManagementSettings.tsx#L28) saves the draft settings under the active role. [audit-log.ts](components/management/audit-log.ts#L58) adds an ID and timestamp to each event, puts the newest event first, and keeps up to 200 records. The Audit Logs screen reads those records back from local storage.
