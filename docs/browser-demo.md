# Nexus browser demo

The role, site, and system checks simulate permissions in the frontend. They use the signed-in demo account, its assigned site IDs, and its optional system list per site. Home uses the same permitted systems for monitoring records, dashboard tiles, and search. Real accounts and data require server-side authentication and authorization.

Dashboards are stored in this browser by account email and stable site ID. The first account and site that opens Home with an unscoped legacy layout adopts that layout. The old copy stays in browser storage. Project summaries from the old branch are read by project ID and keep their baseline site counts. Newly created sites have stable IDs and contribute to the project's count separately.

The site setup wizard simulates the connection test. It stores sample system selections or a credential-free REST base URL without making a network request. Use only dummy endpoints. Real vendor credentials belong in a server-side secret store.

Audit Logs show recent management mutations recorded in this browser. Each site creation or removal writes one entry.

## Dashboard devices

Home renders after device classification in the browser. Android and iOS phones and tablets use the mobile view, including iPad Safari with a desktop-style user agent and multitouch. Windows touch laptops use the desktop editor. Narrowing a desktop window keeps the desktop editor and its responsive layout.

Mobile displays the most recently saved dashboard for the signed-in account and selected site in this browser. Older saves without a timestamp use the first eligible dashboard in stored order. Mobile does not edit or rewrite layouts. Desktop and phone browsers on separate devices need shared persistence to sync.
