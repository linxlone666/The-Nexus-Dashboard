# Branch review and first simplification

Reviewed on November 12, 2026. GitHub branch heads were fetched before this review. This is a source and history review, not a claim that every branch was built or tested.

## Current remote branches

| Branch | Head | What it contains |
| --- | --- | --- |
| `main` | `6578e19` | Reverted dashboard management/demo login integration; does not contain our combined dashboard version |
| `feature/navbar` | `28ac335` | User navigation and dashboard route; homepage passes the required navbar props |
| `feature/overview` | `f49fa42` | Small starter change; homepage still renders an empty fragment |
| `feature/mobile-ui` | `bf31433` | Separate mobile route with placeholder content |
| `feature/login` | `2e1cc77` | Sign-in/invitation/reset components and credential helper; homepage currently opens the Accept component |
| `feature/developer` | `3aa1f31` | Developer workspace, integrations, delivery history, TailGrids components, and `data/Satatus.ts` |
| `feature/admin-superadmin` | `77c964d` | Management dashboards and five-step project initialization |
| `feature/integrations` | `eef3ac5` | Builds on management/vendor work with project integration views |
| `feature/audit-logs` | `56e8784` | Builds on integrations with browser audit activity |
| `feature/dashboard-features` | `c117e0a` | Combined dashboard work, role restrictions, settings, TailGrids controls, permissions/project access, and dashboard chooser |

The `feature/admin-ui` tracking ref in the older checkout points at `c7b2fd9`, but it is absent from the current GitHub branch list. Its cached code has a separate admin implementation. A cached tracking ref is not proof that the remote branch still exists.

## Additional local branches in the older checkout

Local branches with the same heads as remote branches are covered above. These other local heads were also inspected through their file trees, latest commits, and differences:

| Branch | Head | Purpose |
| --- | --- | --- |
| `feature/admin-role` | `fd331c2` | Restricts platform controls to Superadmin |
| `feature/vendors` | `7f2378e` | Adds vendor catalog management |
| `feature/settings` | `6870ed4` | Adds saved management display preferences |
| `feature/role-login` | `6de1a7a` | Adds demo role login |
| `feature/role-navigation-names` | `126dc48` | Renames navigation by dashboard role |
| `feature/working-prototype` | `a096ca3` | Combined prototype with login and TailGrids controls |
| `feature/code-test-review` | `e37ab87` | Static mockup version |
| `feature/sign-in` | `8369815` | Early TailGrids baseline |
| `feature/login` (local) | `8d1df85` | Different local login snapshot from the current remote login head |

Many of our branches are successive checkpoints of the same work, rather than independent pages that all need merging. The combined dashboard branch is the basis for the data extraction.

## Data that can be separated

In our combined dashboard code, users, initial access assignments, projects, vendor records, dashboard readings, overview content, and form/default choices can live in `data/`. This is implemented on `feature/dashboard-data` in the currently open project folder.

The developer branch already separates some records into `data/Satatus.ts`; its integration records and delivery history are still inside their components. Those can move later when working on that branch. Its record names and fields differ from ours, so combining them requires deciding on a common shape first.

The login branch imports `data/credential`; that file includes behavior as well as data. Keep login changes for a separate step so this extraction remains easy to review.

The mobile and overview branches currently provide little business data to extract. Navigation arrays are UI configuration and can stay beside their navigation components.

## Suggested learning order

1. Read `data/users.ts` and follow its import into `UserManagement.tsx`.
2. Understand the table's `.map()`.
3. Understand search's `.filter()` and React state.
4. Follow localStorage reading and saving.
5. Apply the same pattern to projects and vendors.

See `data/README.md` for the new file map and the difference between seed data and browser-saved changes.

## Validation of this extraction

- TypeScript check passed.
- ESLint passed for `app`, `components`, `data`, and `utils`. Untracked prototype scripts are outside this check.
- Production build passed and generated all application routes.
- Compared the extracted users, user totals, projects, vendors, overview content, project options, settings, dashboard readings, and dashboard choices with their original values; all matched.
- Git whitespace check passed.

The other branches were reviewed without merging or rewriting them. This new branch has not been pushed.
