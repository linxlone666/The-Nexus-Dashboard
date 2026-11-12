"use client";
import { useState } from "react";
import { Button } from "@/components/tailgrids/core/button";
import { useDemoSession } from "@/utils/demo-session";
import { getProjectLevel } from "@/utils/permissions";
import { updateProjectDescription } from "@/components/management/project-storage";
import type { ProjectRecord } from "@/components/management/project-storage";
import styles from "./UserProjects.module.css";

export function ProjectDescriptionEditor({
  project,
}: {
  project: ProjectRecord;
}) {
  const { credential, access } = useDemoSession();
  const [draft, setDraft] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const level = getProjectLevel(credential?.role, access, project);
  function save() {
    const error = updateProjectDescription(
      project.key,
      draft ?? project.description,
    );
    if (error) {
      setMessage(error);
      return;
    }
    setDraft(null);
    setMessage("Description saved.");
  }
  if (!level) return null;
  return (
    <div className={styles.editor}>
      <p className={styles.muted}>Your access: {level}</p>
      {level === "Editor" ? (
        <>
          <label htmlFor={"description-" + project.key}>
            Project description
          </label>
          <textarea
            id={"description-" + project.key}
            rows={3}
            maxLength={500}
            value={draft ?? project.description}
            onChange={(event) => {
              setDraft(event.target.value);
              setMessage("");
            }}
          />
          <Button
            size="xs"
            type="button"
            onPress={save}
            disabled={draft === null || draft === project.description}
          >
            Save description
          </Button>
        </>
      ) : (
        <p>
          {project.description || "No description yet."}{" "}
          <span className={styles.muted}>(Read-only)</span>
        </p>
      )}
      <p role="status">{message}</p>
    </div>
  );
}
