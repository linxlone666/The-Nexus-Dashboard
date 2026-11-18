"use client";

import type { ManagedSite } from "@/data/management";
import Link from "next/link";
import { canAccessSite } from "@/data/management";
import { getManagedSiteSystems } from "@/data/mock-system-data";
import type { SystemId } from "@/data/mock-system-data";

import { useId, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { managementLinks } from "@/components/management/navigation";
import { useSidebarNavigation } from "@/utils/sidebar-state";
import { useSelectedWorkSite } from "@/utils/selected-work-site";
import {
  addDashboard,
  dashboardScope,
  deleteDashboard,
  updateDashboard,
  useSavedDashboards,
} from "./saved-dashboards";
import type { SavedDashboard } from "./saved-dashboards";
import { DashboardGrid } from "./DashboardGrid";
import { SystemTile } from "./SystemTile";
import { MonitoringView } from "./MonitoringView";
import { useDemoProfile } from "@/utils/demo-session";
import {
  defaultLayout,
  emptyLayout,
  filterDashboardLayout,
  tileIds,
  tileSystem,
} from "./dashboard-layout";
import type { DashboardLayout } from "./dashboard-layout";
import { useDashboardDevice } from "./dashboard-device";
import { WorkspaceSearch } from "./WorkspaceSearch";
import "./overview.css";

type ViewMode = "edit-dashboard" | SystemId;

const monitoringIcons: Partial<Record<SystemId, string>> = {
  cctv: "camera",
  alarms: "bell",
  access: "door",
  parking: "car",
  attendance: "management-audit",
  visitors: "management-users",
  hr: "management-users",
  projects: "management-projects",
  energy: "management-integrations",
};
export default function NexusDashboardPage() {
  const profile = useDemoProfile();
  const selectedSite = useSelectedWorkSite();
  const device = useDashboardDevice();
  if (!device)
    return (
      <main aria-busy="true" className="p-6">
        Loading workspace…
      </main>
    );
  const site =
    profile && selectedSite && canAccessSite(selectedSite, profile)
      ? selectedSite
      : undefined;
  const scope = profile && site ? dashboardScope(profile.email, site.id) : "";
  return (
    <Workspace
      key={scope}
      site={site}
      profile={profile}
      scope={scope}
      mobile={device === "mobile"}
    />
  );
}

function Workspace({
  site,
  profile,
  scope,
  mobile,
}: {
  site?: ManagedSite;
  profile: ReturnType<typeof useDemoProfile>;
  scope: string;
  mobile: boolean;
}) {
  const { collapsed, previewing, railProps, toggleProps } =
    useSidebarNavigation();
  const navigationId = useId();
  const main = useRef<HTMLElement>(null);
  const mobileMenuButton = useRef<HTMLButtonElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";
  const [currentView, setCurrentView] = useState<ViewMode>("edit-dashboard");
  const [dashboardName, setDashboardName] = useState("");
  const [draftLayout, setDraftLayout] = useState(emptyLayout);
  const [dashboardError, setDashboardError] = useState("");
  const [selectedDashboardId, setSelectedDashboardId] = useState<string | null>(
    null,
  );
  const [addingDashboard, setAddingDashboard] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(false);
  const savedDashboards = useSavedDashboards(scope);
  const dashboards = mobile
    ? savedDashboards
        .filter((dashboard) => dashboard.layout)
        .sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))
    : savedDashboards;
  const selectedDashboard = mobile
    ? dashboards[0]
    : (dashboards.find(({ id }) => id === selectedDashboardId) ??
      dashboards[0]);
  const allowed =
    site && profile?.role !== "Superadmin"
      ? profile?.systemsBySite?.[site.id]
      : undefined;
  const monitoringSystems = site
    ? getManagedSiteSystems(site).filter(
        (system) => allowed === undefined || allowed.includes(system.id),
      )
    : [];
  const permitted = monitoringSystems.map(({ id }) => id);
  const monitoredSystem = monitoringSystems.find(
    ({ id }) => id === currentView,
  );
  function startDashboard() {
    if (mobile || !scope) return;
    setDashboardName("");
    setDraftLayout(emptyLayout);
    setDashboardError("");
    setAddingDashboard(true);
    setEditingDashboard(false);
    setCurrentView("edit-dashboard");
  }

  function saveDashboard() {
    if (mobile || !scope) return;
    const name = dashboardName.trim();
    if (!name) {
      setDashboardError("Enter a dashboard name.");
      return;
    }

    try {
      if (editingDashboard && selectedDashboardId) {
        updateDashboard(
          scope,
          selectedDashboardId,
          name,
          filterDashboardLayout(draftLayout, permitted),
        );
        selectDashboard(selectedDashboardId);
      } else {
        selectDashboard(
          addDashboard(
            scope,
            name,
            filterDashboardLayout(draftLayout, permitted),
          ).id,
        );
      }
    } catch {
      setDashboardError("This browser could not save the dashboard.");
    }
  }

  function selectDashboard(id: string) {
    setSelectedDashboardId(id);
    setMobileMenuOpen(false);
    setAddingDashboard(false);
    setEditingDashboard(false);
    setDashboardError("");
    setCurrentView("edit-dashboard");
  }

  function removeDashboard(dashboard: SavedDashboard) {
    if (mobile || !scope) return;
    if (!window.confirm('Delete "' + dashboard.name + '"?')) return;
    try {
      deleteDashboard(scope, dashboard.id);
      setEditingDashboard(false);
      setDashboardError("");
    } catch {
      setDashboardError("This browser could not delete the dashboard.");
    }
  }

  function openMonitoring(id: SystemId) {
    setCurrentView(id);
    setMobileMenuOpen(false);
    main.current?.scrollTo(0, 0);
    main.current?.focus({ preventScroll: true });
  }

  return (
    <div
      className="overview-shell"
      data-dashboard-device={mobile ? "mobile" : "desktop"}
      data-sidebar-collapsed={collapsed}
      data-sidebar-hover={previewing}
    >
      {!mobile && (
        <TopBar
          home="/home"
          workspace={{
            site: site?.name ?? "Choose site",
            dashboard: addingDashboard
              ? dashboardName.trim() || "New dashboard"
              : (selectedDashboard?.name ?? "Workspace"),
          }}
          name={profile?.name ?? "User"}
          initials={
            profile?.name
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase() || "U"
          }
          roleLabel={profile?.role ?? "User"}
          search={
            <WorkspaceSearch
              site={site}
              systems={monitoringSystems}
              onOpen={openMonitoring}
            />
          }
          searchLabel="Search devices and events"
          searchPlaceholder="Search devices and events"
        />
      )}

      <aside
        className="overview-sidebar"
        {...(!mobile && railProps)}
        onKeyDown={
          mobile
            ? (event) => {
                if (event.key === "Escape" && mobileMenuOpen) {
                  setMobileMenuOpen(false);
                  mobileMenuButton.current?.focus();
                }
              }
            : railProps.onKeyDown
        }
      >
        {mobile ? (
          <button
            ref={mobileMenuButton}
            className="mobile-workspace-toggle"
            type="button"
            aria-controls={navigationId}
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen
                ? "Close mobile navigation"
                : "Open mobile navigation"
            }
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <svg
              className="overview-nav-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <use href="/nexus-navigation.svg#menu" />
            </svg>
          </button>
        ) : (
          <button
            className="overview-sidebar-toggle"
            type="button"
            {...toggleProps}
            aria-controls={navigationId}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            <svg
              className="overview-nav-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <use href="/nexus-navigation.svg#menu" />
            </svg>
            <span className="overview-nav-label">Menu</span>
          </button>
        )}
        <nav
          id={navigationId}
          className="overview-sidebar-links"
          aria-label="Dashboard views"
          hidden={mobile && !mobileMenuOpen}
        >
          {mobile && (
            <div className="mobile-workspace-account">
              <strong>{site?.name ?? "Workspace"}</strong>
              <WorkspaceSearch
                site={site}
                systems={monitoringSystems}
                onOpen={openMonitoring}
              />
              <Link href="/login/sites?view=dashboard">Change site</Link>
              <Link href="/profile">My profile</Link>
              {managementLinks(profile?.role).map(({ href, label }) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          )}
          <div
            className="overview-nav-group"
            role="group"
            aria-label="Workspace"
          >
            <span className="overview-nav-group-title" aria-hidden="true">
              Workspace
            </span>
            {(mobile ? dashboards.slice(0, 1) : dashboards).map(
              ({ id, name }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={
                    currentView === "edit-dashboard" &&
                    !addingDashboard &&
                    selectedDashboard?.id === id
                      ? "true"
                      : undefined
                  }
                  aria-label={name}
                  title={name}
                  onClick={() => selectDashboard(id)}
                >
                  <svg
                    className="overview-nav-icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <use href="/nexus-navigation.svg#grid" />
                  </svg>
                  <span className="overview-nav-label overview-dashboard-link-label">
                    {name}
                  </span>
                </button>
              ),
            )}
            {!mobile && (
              <button
                type="button"
                className="overview-add-dashboard"
                onClick={startDashboard}
                disabled={!scope}
                aria-label="New dashboard"
                title="New dashboard"
              >
                <svg
                  className="overview-nav-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="overview-nav-label">New dashboard</span>
              </button>
            )}
          </div>
          <div
            className="overview-nav-group"
            role="group"
            aria-label="Monitoring"
          >
            <span className="overview-nav-group-title" aria-hidden="true">
              Monitoring
            </span>
            {monitoringSystems.map(({ id, name }) => (
              <button
                key={id}
                type="button"
                aria-current={currentView === id ? "true" : undefined}
                aria-label={name}
                title={name}
                onClick={() => {
                  setDashboardError("");
                  openMonitoring(id);
                }}
              >
                <svg
                  className="overview-nav-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <use
                    href={
                      "/nexus-navigation.svg#" +
                      (monitoringIcons[id] ?? "chart")
                    }
                  />
                </svg>
                <span className="overview-nav-label overview-dashboard-link-label">
                  {name}
                </span>
              </button>
            ))}
            {!monitoringSystems.length && (mobile || !collapsed) && (
              <p className="monitoring-nav-empty">
                {site
                  ? "No systems configured"
                  : "Choose a site to view systems"}
              </p>
            )}
          </div>
          {mobile && (
            <Link
              href="/mobile-ui"
              className="monitoring-site-link mobile-preview-link"
            >
              Mobile UI demo
            </Link>
          )}
        </nav>
      </aside>

      {/* Main Container */}
      <main
        className="overview-main"
        ref={main}
        tabIndex={0}
        aria-label={monitoredSystem?.name ?? "Workspace content"}
      >
        {scope &&
          currentView === "edit-dashboard" &&
          (addingDashboard || selectedDashboard) && (
            <DashboardView
              site={site}
              mobile={mobile}
              permitted={permitted}
              onMonitor={openMonitoring}
              dashboardName={
                addingDashboard || editingDashboard
                  ? dashboardName
                  : (selectedDashboard?.name ?? "")
              }
              layout={
                addingDashboard || editingDashboard
                  ? draftLayout
                  : (selectedDashboard?.layout ?? defaultLayout)
              }
              onLayoutChange={setDraftLayout}
              onReset={() => setDraftLayout(defaultLayout)}
              isCreating={addingDashboard}
              isEditing={editingDashboard}
              onEdit={() => {
                if (mobile || !selectedDashboard) return;
                setDashboardName(selectedDashboard.name);
                setSelectedDashboardId(selectedDashboard.id);
                setDraftLayout(selectedDashboard.layout ?? defaultLayout);
                setDashboardError("");
                setEditingDashboard(true);
              }}
              onNameChange={setDashboardName}
              onSave={saveDashboard}
              onCancel={() => {
                setAddingDashboard(false);
                setEditingDashboard(false);
                setDashboardError("");
                setCurrentView("edit-dashboard");
              }}
              onDelete={
                selectedDashboard
                  ? () => removeDashboard(selectedDashboard)
                  : undefined
              }
              error={dashboardError}
            />
          )}
        {currentView !== "edit-dashboard" &&
          (site && monitoredSystem ? (
            <MonitoringView site={site} system={monitoredSystem} />
          ) : (
            <section className="monitoring-history">
              <h1 className="overview-page-title">Monitoring</h1>
              <p className="overview-subtitle">
                {site
                  ? "This system is not configured for the selected site."
                  : "Choose a site to view system data."}
              </p>
              {!site && (
                <Link className="monitoring-site-link" href="/login/sites">
                  Choose a site
                </Link>
              )}
            </section>
          ))}
        {currentView === "edit-dashboard" &&
          (!scope || (!addingDashboard && !selectedDashboard)) && (
            <section className="overview-views-card">
              <h1 className="overview-page-title">Workspace</h1>
              <p className="overview-subtitle">
                {scope
                  ? mobile
                    ? "No desktop dashboard has been saved for this site yet."
                    : "No saved dashboards yet."
                  : "Choose an assigned site to open a workspace."}
              </p>
              {!scope && (
                <Link className="monitoring-site-link" href="/login/sites">
                  Choose a site
                </Link>
              )}
              {!mobile && (
                <button
                  type="button"
                  className="overview-save-button"
                  onClick={startDashboard}
                  disabled={!scope}
                >
                  New dashboard
                </button>
              )}
            </section>
          )}
      </main>
    </div>
  );
}

function DashboardView({
  site,
  mobile,
  permitted,
  onReset,
  onMonitor,
  dashboardName,
  layout,
  onLayoutChange,
  isCreating,
  isEditing,
  onEdit,
  onNameChange,
  onSave,
  onCancel,
  onDelete,
  error,
}: {
  site?: ManagedSite;
  mobile: boolean;
  permitted: readonly SystemId[];
  onReset: () => void;
  onMonitor: (system: SystemId) => void;
  dashboardName: string;
  layout: DashboardLayout;
  onLayoutChange: (layout: DashboardLayout) => void;
  isCreating: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  error: string;
}) {
  const showForm = !mobile && (isCreating || isEditing);

  return (
    <div className="overview-edit-section">
      <div>
        <div className="overview-breadcrumb">NEXUS / WORKSPACE</div>
        <div className="overview-heading-row">
          <h1 className="overview-page-title overview-dashboard-title">
            {showForm ? (
              <input
                className="overview-dashboard-name"
                aria-label="Dashboard name"
                placeholder="Untitled dashboard"
                value={dashboardName}
                maxLength={80}
                onChange={(event) => onNameChange(event.target.value)}
              />
            ) : (
              dashboardName
            )}
          </h1>

          {!mobile && (
            <div className="overview-heading-actions">
              {showForm ? (
                <>
                  {isEditing && (
                    <button
                      type="button"
                      className="overview-secondary-button"
                      onClick={onReset}
                    >
                      Reset layout
                    </button>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      className="overview-delete-dashboard"
                      onClick={onDelete}
                    >
                      Delete dashboard
                    </button>
                  )}
                  <button
                    type="button"
                    className="overview-secondary-button"
                    onClick={onCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="overview-save-button"
                    onClick={onSave}
                  >
                    {isCreating ? "Save dashboard" : "Save changes"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="overview-edit-dashboard-button"
                  onClick={onEdit}
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
        {error && (
          <p role="alert" className="overview-dashboard-error">
            {error}
          </p>
        )}
      </div>

      <DashboardGrid
        key={
          (isCreating ? "new" : isEditing ? "edit" : "view") +
          permitted.join(",")
        }
        layout={filterDashboardLayout(layout, permitted)}
        availableKinds={tileIds.filter((kind) =>
          permitted.includes(tileSystem(kind)),
        )}
        mobile={mobile}
        site={site}
        editing={showForm}
        onChange={onLayoutChange}
        renderTile={(kind, title, display, preview, dataKey, cameraIds) => (
          <SystemTile
            title={title}
            site={site}
            systemId={tileSystem(kind)}
            display={display}
            dataKey={dataKey}
            cameraIds={cameraIds}
            onOpen={
              !preview && site && permitted.includes(tileSystem(kind))
                ? () => onMonitor(tileSystem(kind))
                : undefined
            }
          />
        )}
      />
    </div>
  );
}
