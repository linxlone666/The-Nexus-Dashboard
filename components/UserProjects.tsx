"use client";
import Link from "next/link";
import { useState } from "react";
import { UserNavbar } from "./UserNavbar";
import { SignOutButton } from "./SignOutButton";
import { ProjectDescriptionEditor } from "./ProjectDescriptionEditor";
import { useAccessibleProjects } from "./management/project-storage";
import { useDemoSession } from "@/utils/demo-session";
import { getProjectLevel, hasPermission } from "@/utils/permissions";
import styles from "./UserProjects.module.css";

export function UserProjects() {
  const projects = useAccessibleProjects();
  const { credential, access } = useDemoSession();
  const [selectedKey, setSelectedKey] = useState<string>();
  const selected =
    projects.find((project) => project.key === selectedKey) ?? projects[0];
  return (
    <div className={styles.page}>
      <UserNavbar
        site="Nexus Headquarters"
        workspace="My projects"
        user={{ name: "User", initials: "U" }}
      />
      <main className={styles.content}>
        <div className={styles.heading}>
          <div>
            <h1>My projects</h1>
            <p className={styles.muted}>
              Only projects assigned to your account appear here.
            </p>
          </div>
          <div>
            {hasPermission(credential?.role, access, "View Dashboard") && (
              <Link href="/dashboard">Dashboard</Link>
            )}{" "}
            <SignOutButton />
          </div>
        </div>
        <div className={styles.columns}>
          <section className={styles.card}>
            <h2>Assigned projects</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Organization</th>
                  <th>Your access</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.key}>
                    <td>
                      <button
                        type="button"
                        aria-pressed={selected?.key === project.key}
                        onClick={() => setSelectedKey(project.key)}
                      >
                        {project.name}
                      </button>
                    </td>
                    <td>{project.organization}</td>
                    <td>
                      {getProjectLevel(credential?.role, access, project)}
                    </td>
                  </tr>
                ))}
                {!projects.length && (
                  <tr>
                    <td colSpan={3}>
                      No projects assigned yet. Ask your administrator to assign
                      one in Users → Permissions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
          <aside className={styles.card}>
            <h2>{selected?.name ?? "Project details"}</h2>
            {selected ? (
              <ProjectDescriptionEditor key={selected.key} project={selected} />
            ) : (
              <p className={styles.muted}>
                Assigned projects will appear here.
              </p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
