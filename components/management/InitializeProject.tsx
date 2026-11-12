"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { recordAuditActivity } from "./audit-log";
import { organizations } from "@/data/projects";
import { steps, environments, owners, types } from "@/data/project-options";
import {
  AdminSuperadminLayout,
  managementRoutes,
} from "./AdminSuperadminLayout";
import { saveProject } from "./project-storage";
import { parseVendorEndpoint, useVendors } from "./vendor-catalog";
import type { Vendor, VendorSource } from "@/data/vendors";
import styles from "./management.module.css";
import wizard from "./InitializeProject.module.css";

export function InitializeProject() {
  const router = useRouter();
  const vendors = useVendors();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [organization, setOrganization] = useState<string>(organizations[0]);
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] =
    useState<(typeof environments)[number][0]>("Production");
  const [owner, setOwner] = useState(owners[0]);
  const [vendor, setVendor] = useState<Vendor>();
  const [vendorQuery, setVendorQuery] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [authentication, setAuthentication] = useState("API key");
  const [credentialReference, setCredentialReference] = useState("");
  const [tested, setTested] = useState(false);
  const [mappings, setMappings] = useState<VendorSource[]>([]);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const projectsUrl = managementRoutes.Superadmin.Projects;
  const visibleVendors = vendors.filter((item) =>
    item.name.toLowerCase().includes(vendorQuery.trim().toLowerCase()),
  );
  const mapped = mappings.filter(
    (mapping) => mapping.type && mapping.name.trim(),
  ).length;

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  function goTo(next: number) {
    setError("");
    setStep(next);
  }

  function selectVendor(next: Vendor) {
    if (vendor?.id === next.id) return;
    setVendor(next);
    setBaseUrl(next.url);
    setAuthentication(next.authentication);
    setCredentialReference(next.reference);
    setMappings(next.sources);
    setTested(false);
    setError("");
  }

  function testConnection() {
    if (!parseVendorEndpoint(baseUrl)) {
      setError(
        "Use an HTTP or HTTPS base URL without credentials, query parameters, or fragments.",
      );
      return;
    }
    if (!credentialReference.trim()) {
      setError("Enter a credential reference before testing.");
      return;
    }
    setTested(true);
    setError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      step === 0 &&
      (!name.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key.trim()))
    ) {
      setError(
        "Enter a project name and a key using lowercase letters, numbers, and single hyphens.",
      );
      return;
    }
    if (
      step === 1 &&
      !vendors.some(
        (item) =>
          item.id === vendor?.id &&
          item.status === "Connected" &&
          item.sources.length > 0,
      )
    ) {
      setError("Select a connected vendor with sample data sources.");
      return;
    }
    if (step === 2 && !tested) {
      setError("Test the demo connection before continuing.");
      return;
    }
    if (step === 3 && mapped !== mappings.length) {
      setError("Choose a Nexus type and display name for every source.");
      return;
    }
    if (step < steps.length - 1) {
      goTo(step + 1);
      return;
    }
    if (!vendor) return;

    const problem = saveProject({
      name: name.trim(),
      key: key.trim(),
      organization,
      description: description.trim(),
      environment,
      owner,
      vendor: vendor.name,
      vendorId: vendor.id,
      baseUrl: baseUrl.trim(),
      authentication,
      credentialReference: credentialReference.trim(),
      mappings: mappings.map((mapping) => ({
        ...mapping,
        name: mapping.name.trim(),
      })),
      sites: null,
      status: "Onboarding",
      updated: new Date().toISOString().slice(0, 10),
    });
    if (problem) {
      setError(problem);
      return;
    }
    recordAuditActivity({
      role: "Superadmin",
      category: "Projects",
      action: "Project initialized",
      target: name.trim(),
      outcome: "Success",
    });
    router.push(projectsUrl);
  }

  return (
    <AdminSuperadminLayout
      role="Superadmin"
      active="Projects"
      query={vendorQuery}
      onQueryChange={step === 1 ? setVendorQuery : undefined}
      searchLabel="Search vendors from the top bar"
    >
      <div className={styles.heading}>
        <div>
          <p>NEXUS / Superadmin / Projects</p>
          <h1>Initialize New Project</h1>
          <div className={styles.muted}>
            Create a project, connect a vendor, and configure the data sources.
          </div>
        </div>
      </div>
      <ol className={wizard.steps} aria-label="Project setup progress">
        {steps.map((label, index) => (
          <li key={label} aria-current={index === step ? "step" : undefined}>
            <span className={wizard.marker} aria-hidden="true">
              {index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <form onSubmit={submit}>
        <div className={styles.columns}>
          <section
            className={`${styles.card} ${wizard.panel}`}
            aria-labelledby="setup-step"
          >
            <h2 id="setup-step" tabIndex={-1} ref={heading}>
              {steps[step]}
            </h2>

            {step === 0 && (
              <>
                <p className={styles.muted}>
                  Basic information for the new project.
                </p>
                <div className={wizard.fields}>
                  <label>
                    Project name
                    <Input
                      required
                      maxLength={100}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </label>
                  <label>
                    Project key
                    <Input
                      required
                      maxLength={64}
                      placeholder="e.g. prj-001"
                      value={key}
                      onChange={(event) => setKey(event.target.value)}
                    />
                  </label>
                  <label className={wizard.full}>
                    Description{" "}
                    <textarea
                      maxLength={500}
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </label>
                  <label>
                    Organization
                    <select
                      value={organization}
                      onChange={(event) => setOrganization(event.target.value)}
                    >
                      {organizations.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Project owner
                    <select
                      value={owner}
                      onChange={(event) => setOwner(event.target.value)}
                    >
                      {owners.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <fieldset className={wizard.environments}>
                  <legend>Environment</legend>
                  <div>
                    {environments.map(([label, detail]) => (
                      <label key={label}>
                        <input
                          type="radio"
                          name="environment"
                          checked={environment === label}
                          onChange={() => setEnvironment(label)}
                        />
                        <span>
                          {label}
                          <small>{detail}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 1 && (
              <>
                <p className={styles.muted}>
                  Choose a connected demo provider with sample data sources.
                </p>
                <Input
                  type="search"
                  aria-label="Search vendors"
                  placeholder="Search vendors..."
                  value={vendorQuery}
                  onChange={(event) => setVendorQuery(event.target.value)}
                />
                <div className={styles.tableScroll}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">Provider</th>
                        <th scope="col">Connection</th>
                        <th scope="col">Data sources</th>
                        <th scope="col">Selection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleVendors.map((item) => (
                        <tr key={item.name}>
                          <th scope="row">{item.name}</th>
                          <td>{item.status}</td>
                          <td>{item.sources.length}</td>
                          <td>
                            <input
                              type="radio"
                              name="vendor"
                              aria-label={`Select ${item.name}`}
                              disabled={
                                item.status !== "Connected" ||
                                !item.sources.length
                              }
                              checked={vendor?.id === item.id}
                              onChange={() => selectVendor(item)}
                            />
                          </td>
                        </tr>
                      ))}
                      {!visibleVendors.length && (
                        <tr>
                          <td colSpan={4}>No vendors match your search.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className={styles.muted}>
                  Configure the endpoint and test it in demo mode before mapping
                  devices.
                </p>
                <div className={wizard.fields}>
                  <label className={wizard.full}>
                    Base URL
                    <Input
                      type="url"
                      required
                      value={baseUrl}
                      onChange={(event) => {
                        setBaseUrl(event.target.value);
                        setTested(false);
                      }}
                    />
                  </label>
                  <label>
                    Authentication type
                    <select
                      value={authentication}
                      onChange={(event) => {
                        setAuthentication(event.target.value);
                        setTested(false);
                      }}
                    >
                      <option>API key</option>
                      <option>Bearer token</option>
                    </select>
                  </label>
                  <label>
                    Credential reference
                    <Input
                      required
                      maxLength={100}
                      value={credentialReference}
                      onChange={(event) => {
                        setCredentialReference(event.target.value);
                        setTested(false);
                      }}
                    />
                  </label>
                </div>
                <p className={styles.muted}>Use a credential name or ID.</p>
                <Button
                  size="xs"
                  appearance="outline"
                  type="button"
                  onPress={testConnection}
                >
                  Test demo connection
                </Button>
                {tested && (
                  <p role="status" className={wizard.notice}>
                    Demo connection verified · {mappings.length} sample sources
                    available.
                  </p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <p className={styles.muted}>
                  Assign a Nexus type to each vendor source before continuing.
                </p>
                <div className={styles.tableScroll}>
                  <table className={`${styles.table} ${wizard.mapping}`}>
                    <thead>
                      <tr>
                        <th scope="col">Vendor source</th>
                        <th scope="col">Nexus type</th>
                        <th scope="col">Display name</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map((mapping, index) => (
                        <tr key={mapping.source}>
                          <th scope="row">{mapping.source}</th>
                          <td>
                            <select
                              aria-label={`Nexus type for ${mapping.source}`}
                              value={mapping.type}
                              onChange={(event) => {
                                setMappings(
                                  mappings.map((item, position) =>
                                    position === index
                                      ? { ...item, type: event.target.value }
                                      : item,
                                  ),
                                );
                              }}
                            >
                              <option value="">Select type</option>
                              {types.map((type) => (
                                <option key={type}>{type}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <Input
                              required
                              maxLength={100}
                              aria-label={`Display name for ${mapping.source}`}
                              value={mapping.name}
                              onChange={(event) => {
                                setMappings(
                                  mappings.map((item, position) =>
                                    position === index
                                      ? { ...item, name: event.target.value }
                                      : item,
                                  ),
                                );
                              }}
                            />
                          </td>
                          <td>
                            <Badge
                              color={
                                mapping.type && mapping.name.trim()
                                  ? "success"
                                  : "warning"
                              }
                            >
                              {mapping.type && mapping.name.trim()
                                ? "Mapped"
                                : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p role="status" className={wizard.notice}>
                  {mapped} of {mappings.length} sources mapped
                </p>
              </>
            )}

            {step === 4 && (
              <>
                <p className={styles.muted}>
                  Review the configuration before creating the project in this
                  browser.
                </p>
                <div className={wizard.review}>
                  <div>
                    <h3>Project</h3>
                    <p>
                      {name} · {organization} · {environment}
                    </p>
                  </div>
                  <Button
                    size="xs"
                    appearance="outline"
                    type="button"
                    onPress={() => goTo(0)}
                  >
                    Edit details
                  </Button>
                  <div>
                    <h3>Vendor connection</h3>
                    <p>{vendor?.name} · Demo connection verified</p>
                  </div>
                  <Button
                    size="xs"
                    appearance="outline"
                    type="button"
                    onPress={() => goTo(2)}
                  >
                    Edit API
                  </Button>
                  <div>
                    <h3>Device mapping</h3>
                    <p>
                      {mappings
                        .map((mapping) => mapping.name.trim())
                        .join(" · ")}
                    </p>
                  </div>
                  <Button
                    size="xs"
                    appearance="outline"
                    type="button"
                    onPress={() => goTo(3)}
                  >
                    Edit mapping
                  </Button>
                </div>
                <p className={wizard.notice}>Ready to create</p>
              </>
            )}
            {error && (
              <p role="alert" className={wizard.error}>
                {error}
              </p>
            )}
          </section>

          <aside className={styles.card} aria-labelledby="setup-summary">
            <h2 id="setup-summary">Project summary</h2>
            <p className={styles.muted}>
              Your choices carry through each step.
            </p>
            <dl className={wizard.summary}>
              {[
                ["Project", name],
                ["Project key", key],
                ["Organization", organization],
                ["Environment", environment],
                ["Owner", owner],
                ["Vendor", vendor?.name],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
        <div className={`${styles.actions} ${wizard.footer}`}>
          {step === 0 ? (
            <Link href={projectsUrl}>Cancel</Link>
          ) : (
            <Button
              size="xs"
              appearance="outline"
              type="button"
              onPress={() => goTo(step - 1)}
            >
              Back
            </Button>
          )}
          <Button size="xs" type="submit">
            {step === steps.length - 1
              ? "Create project"
              : `Next: ${steps[step + 1]}`}
          </Button>
        </div>
      </form>
    </AdminSuperadminLayout>
  );
}
