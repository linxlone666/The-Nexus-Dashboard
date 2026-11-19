# The Nexus Dashboard — Team Guide

This guide explains how to run the frontend, develop separate features, and merge them through GitHub.

## Tools we use

- **Next.js and React:** pages, layouts, and interactive components.
- **TypeScript:** types for component props and data.
- **Tailwind CSS v4:** styling with utility classes.
- **TailGrids:** configuration and theme styles are included; components can be added as needed.
- **npm:** use this consistently so everyone shares `package-lock.json`.

Sign in at / and choose a site to open the workspace at /home. The mobile UI prototype is available at /mobile-ui, with companion screens at /activity, /alarms, and /cctv. Those screens show sample data.

## 1. First-time setup

Install Git and Node.js 24 LTS. Use the same Node.js major version across the team. npm comes with Node.js. Check your installation:

```bash
git --version
node --version
npm --version
```

Accept the GitHub repository invitation if required, then clone:

```bash
git clone https://github.com/linxlone666/The-Nexus-Dashboard.git
cd The-Nexus-Dashboard
```

If you already cloned the project, open that folder instead. Run these commands from the project root, which contains `package.json`:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is busy, use the URL printed in the terminal. Keep the terminal running while developing. Save files to see updates; press **Ctrl+C** to stop the server.

`npm ci` installs the exact dependency versions in `package-lock.json`. You do not need to install Next.js, React, or Tailwind separately.

## 2. Project structure

```text
app/
  layout.tsx          Shared layout and global CSS import
  page.tsx            Homepage at /
  globals.css         Tailwind import and shared theme styles
components/
  Navbar.tsx          Shared navigation (currently unfinished)
public/               Static assets, referenced as /filename.png
utils/
  cn.ts               Helper for combining Tailwind classes
tailgrids.config.json TailGrids configuration
next.config.ts        Next.js and Tailwind loader configuration
package.json          Scripts and dependencies
package-lock.json     Exact shared dependency versions
```

Adding `app/cameras/page.tsx`, for example, creates the `/cameras` route. Put reusable UI in `components/`. Components using React state or browser event handlers need `"use client"` at the top of their file.

Agree on routes, colors, shared component props, and mock-data types before splitting related features. Coordinate edits to shared files such as `app/layout.tsx`, `app/globals.css`, and dependency configuration.

## 3. Check that Tailwind is visible

The starter homepage currently renders no content. To test styling temporarily on your own branch, use this in `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <h1 className="text-4xl font-bold text-teal-600">
        Nexus Dashboard
      </h1>
    </main>
  );
}
```

You should see large teal text on a light gray background. Replace the example with your actual page when ready.

The existing setup imports Tailwind in `app/globals.css`, imports that stylesheet from `app/layout.tsx`, and configures `@tailwindcss/turbopack` in `next.config.ts`. Do not add a second Tailwind integration just because a tutorial uses a different setup.

To add a TailGrids component from the project root:

```bash
npx @tailgrids/cli@latest add button
```

Review generated files and dependency changes, then import the component using its generated path. See the [TailGrids Next.js guide](https://tailgrids.com/docs/installation/next).

## 4. Start your own branch

Everyone clones the same repository and runs the complete app locally. Create a separate branch for each task, then merge completed work into `main` through a pull request (PR).

- **Branch:** a separate line of development.
- **Commit:** a saved checkpoint of changes.
- **Push:** upload your commits to GitHub.
- **Pull request:** propose changes for review and merging.
- **Pull:** bring remote changes into your local branch.

Commit unfinished work on its current branch before switching. Start a new task from updated `main`:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/camera-grid
```

Replace `feature/camera-grid` with your task name, such as `feature/navbar` or `fix/mobile-spacing`. Create a new branch for your next task after this one is merged.

Example four-person split (these routes are proposed examples):

| Developer | Task | Main files |
| --- | --- | --- |
| A | Shared layout and navigation | `app/layout.tsx`, navigation components |
| B | Dashboard overview | `app/page.tsx`, summary cards |
| C | Camera page | `app/cameras/page.tsx`, camera components |
| D | Activity page | `app/activity/page.tsx`, activity components |

Avoid independently replacing the same shared files. Use GitHub Issues to assign tasks and describe what finished means.

## 5. Check, commit, and push

Review your changes:

```bash
git status
git diff
npm run lint
npm run build
```

Also run `npm run dev` and test the feature in your browser, including mobile width, navigation, buttons, and forms.

Stage files belonging to your task. For example, after creating the camera page:

```bash
git add app/cameras/page.tsx
git commit -m "Add camera page"
git push -u origin feature/camera-grid
```

Stage related component files explicitly too. If you intentionally add a dependency with `npm install package-name`, commit both `package.json` and `package-lock.json`. Coordinate new dependencies with the team.

Do not commit `node_modules`, `.next`, passwords, tokens, or local environment files.

## 6. Open a pull request and merge

1. Open the repository on GitHub and choose **Compare & pull request** for your branch.
2. Choose `main` as the base and your feature branch as the compare branch.
3. Explain what changed and how you tested it. Include screenshots for UI changes and mention unfinished behavior.
4. Ask a teammate to review and try the feature.
5. Make fixes on the same branch, commit, and push again; the PR updates automatically.
6. Merge after review and successful checks. Delete the merged feature branch on GitHub when finished.

Merging combines your changes into the shared app. Nobody needs to copy and paste your files into their project.

## 7. Get teammates' merged changes

With your current work committed:

```bash
git switch main
git pull --ff-only origin main
```

Run `npm ci` again if the dependency files changed, then restart the dev server.

To update an existing feature branch with the latest shared changes, commit your work first, then:

```bash
git switch feature/camera-grid
git fetch origin
git merge origin/main
```

Check the resulting app and push your feature branch. Do not force-push to `main`.

## 8. Resolve merge conflicts

Conflicts happen when Git needs help combining overlapping edits.

1. Run `git status` to find conflicting files.
2. Open each file in your editor and inspect both versions with the teammate involved.
3. Keep or combine the intended code and remove the `<<<<<<<`, `=======`, and `>>>>>>>` markers.
4. Stage resolved files, then commit and push:

```bash
git add path/to/resolved-file
git commit -m "Resolve conflicts with main"
git push
```

Replace the example path with the actual file. Run lint, build, and browser checks afterward. Do not blindly accept all current or incoming changes. To cancel an unfinished merge, use `git merge --abort`.

## 9. Troubleshooting

| Problem | What to check |
| --- | --- |
| `node` or `npm` not recognized | Install Node.js and reopen the terminal. |
| Cannot find `package.json` | Change into the cloned project root. |
| Missing dependencies | Run `npm ci` from the root. |
| Blank homepage | The starter page is empty. Add JSX or use the Tailwind example above. |
| Navbar missing | The starter navbar must return JSX and be rendered by a page or layout. |
| Styles missing | Check terminal/browser errors, save files, and restart `npm run dev`. Opening prototype HTML does not test the Next.js app. |
| Port 3000 busy | Use the alternate URL printed by Next.js or stop the other server. |
| Git would overwrite local changes | Commit your work on its branch before switching or pulling. |
| `git pull --ff-only` fails | Histories diverged. Inspect with a teammate instead of force-pushing. |
| GitHub rejects push | Check access, authentication, branch name, and whether remote changes need merging. |

Share the actual error message with the team. Avoid deleting the lockfile or running `npm audit fix --force` as a general troubleshooting step.

## Daily workflow

1. Update your code and create a task branch.
2. Build your assigned feature and coordinate shared-file edits.
3. Test in the browser, run lint, and run the production build.
4. Commit, push your branch, and open a PR.
5. Get a teammate's review before merging to `main`.

## Vercel Preview

In the connected Vercel project, use the repository root, the Next.js preset,
and Node.js 24.x. Leave the output directory at the Next.js default. Use
`npm ci` for installation and `npm run build` for the build.

Set `NEXT_PUBLIC_NEXUS_DEMO=true` in the **Preview** environment for
`feature/dashboard-rebuild`, then deploy that branch. Next.js reads this
setting at build time. Keep the variable unset in Vercel Production so demo
sign-in stays disabled there. For a local production-mode test, set the same
variable before running `npm run build`, then run `npm run start`.

Open `/login?demo=user` and `/login?demo=admin` in separate tabs on the same
Preview URL. The account and selected site are stored per tab in
`sessionStorage`. Demo permissions, audit logs, and layouts use
`localStorage` and are shared only on the same origin within the same browser
profile. A second browser profile or device can sign in independently.

## Shared multi-account demo

Management accounts, sites, access permissions, settings, and audit history are now stored on the Node.js demo server. Each tab keeps its own login in session storage, so normal and incognito browsers can sign in as different accounts. Open browsers sync shared management data every second and when focused.

Run one server with `npm run dev` and use the same URL in both browsers. Sign in as `superadmin@company.com` / `pass` to add an account, then use the new account's email and password in incognito. An Admin signed in in the other browser will see the new user without refreshing. Signing out in one browser leaves the other signed in.

Data and sessions persist across server restarts in `.nexus-demo/management.json` (ignored by Git). Browser-local management records from older versions are not automatically imported. Set `NEXUS_DEMO_DATA_FILE` to use another persistent path. For a production build used as a demo, set `NEXT_PUBLIC_NEXUS_DEMO=true` at build and runtime. This file-backed demo supports one Node.js server with persistent storage; serverless or multiple replicas need a shared database. Passwords remain demo-only data and are excluded from API read responses. Dashboard layouts and other personal browser preferences remain browser-local.
