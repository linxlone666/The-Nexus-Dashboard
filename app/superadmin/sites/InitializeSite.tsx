"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { systemCatalog } from "@/data/mock-system-data";
import type { SystemId, WorkSiteId } from "@/data/mock-system-data";
import { workSites } from "@/data/work-sites";
import { saveSite } from "@/utils/management-store";
import "./site-initialization.css";

const steps = [
  "Site details",
  "Vendor",
  "Connection configuration",
  "Data mapping",
  "Review & create",
] as const;

function validEndpoint(value: string) {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

export function InitializeSite({
  onCancel,
  onCreated,
}: {
  onCancel: () => void;
  onCreated: (id: string, siteName: string) => void;
}) {
  const [vendor, setVendor] = useState("");
  const [tested, setTested] = useState(false);
  const submitting = useRef(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [active, setActive] = useState(true);
  const [source, setSource] = useState<"sample" | "rest">("sample");
  const [sampleSiteId, setSampleSiteId] = useState<WorkSiteId>(workSites[0].id);
  const [endpoint, setEndpoint] = useState("");
  const [systemIds, setSystemIds] = useState<SystemId[]>([]);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = useId();

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  function goTo(next: number) {
    setError("");
    setStep(next);
  }

  function resetConnection() {
    setTested(false);
    setSystemIds([]);
    setError("");
  }

  function testConnection() {
    if (source === "rest" && !validEndpoint(endpoint.trim())) {
      setError(
        "Enter an HTTP or HTTPS URL without credentials, a query string, or a fragment.",
      );
      return;
    }
    setError("");
    setTested(true);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 0 && (!name.trim() || !location.trim())) {
      setError("Enter a site name and location.");
      return;
    }
    if (step === 1 && source === "rest" && !vendor.trim()) {
      setError("Enter the vendor name.");
      return;
    }
    if (step === 2 && source === "rest" && !validEndpoint(endpoint.trim())) {
      setError(
        "Enter an HTTP or HTTPS URL without credentials, a query string, or a fragment.",
      );
      return;
    }
    if (step === 2 && !tested) {
      setError("Run the simulated connection test first.");
      return;
    }
    if (step === 3 && !systemIds.length) {
      setError("Select at least one system.");
      return;
    }
    if (step < steps.length - 1) {
      goTo(step + 1);
      return;
    }

    if (submitting.current) return;
    submitting.current = true;
    try {
      const id = crypto.randomUUID();
      saveSite({
        id,
        setupStatus: source === "sample" ? "ready" : "onboarding",
        name,
        location,
        active,
        source:
          source === "sample"
            ? { kind: "sample", sampleSiteId, systemIds }
            : {
                kind: "rest",
                endpoint: endpoint.trim(),
                systemIds,
                vendor: vendor.trim(),
              },
      });
      onCreated(id, name.trim());
    } catch (problem) {
      submitting.current = false;
      setError(
        problem instanceof Error
          ? problem.message
          : "Could not create the site.",
      );
    }
  }

  return (
    <section className="site-initialization" aria-label="Site initialization">
      <header className="site-initialization-heading">
        <div>
          <h1>Initialize Site</h1>
          <p className="superadmin-muted">
            Set up a work site and choose its data sources.
          </p>
        </div>
        <button
          type="button"
          className="superadmin-text-link"
          onClick={onCancel}
        >
          Cancel setup
        </button>
      </header>
      <ol className="site-setup-steps" aria-label="Site setup progress">
        {steps.map((label, index) => (
          <li key={label} aria-current={step === index ? "step" : undefined}>
            <span aria-hidden="true">{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <form
        className="superadmin-card superadmin-form"
        onSubmit={submit}
        aria-labelledby={headingId}
      >
        <h2 id={headingId} ref={heading} tabIndex={-1}>
          {steps[step]}
        </h2>
        {step === 0 && (
          <>
            <label>
              Site name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={100}
                required
              />
            </label>
            <label>
              Location
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                maxLength={100}
                required
              />
            </label>
            <label className="superadmin-checkbox">
              <input
                type="checkbox"
                checked={active}
                onChange={(event) => setActive(event.target.checked)}
              />{" "}
              Active
            </label>
          </>
        )}
        {step === 1 && (
          <fieldset>
            <legend>Vendor or data provider</legend>
            <label className="superadmin-checkbox">
              <input
                type="radio"
                name="source"
                checked={source === "sample"}
                onChange={() => {
                  setSource("sample");
                  resetConnection();
                }}
              />{" "}
              Nexus sample data
            </label>
            <label className="superadmin-checkbox">
              <input
                type="radio"
                name="source"
                checked={source === "rest"}
                onChange={() => {
                  setSource("rest");
                  resetConnection();
                }}
              />{" "}
              Custom REST vendor
            </label>
            {source === "rest" && (
              <label>
                Vendor name
                <input
                  value={vendor}
                  maxLength={100}
                  onChange={(event) => {
                    setVendor(event.target.value);
                    resetConnection();
                  }}
                  required
                />
              </label>
            )}
          </fieldset>
        )}
        {step === 2 &&
          (source === "sample" ? (
            <label>
              Sample site
              <select
                value={sampleSiteId}
                onChange={(event) => {
                  setSampleSiteId(event.target.value as WorkSiteId);
                  resetConnection();
                }}
              >
                {workSites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <label>
                Base URL
                <input
                  type="url"
                  value={endpoint}
                  onChange={(event) => {
                    setEndpoint(event.target.value);
                    resetConnection();
                  }}
                  placeholder="https://example.com/api"
                  required
                />
              </label>
              <p className="superadmin-muted">
                Use a dummy URL. The connection test is simulated.
              </p>
            </>
          ))}
        {step === 2 && (
          <div>
            <button
              type="button"
              className="superadmin-button"
              onClick={testConnection}
            >
              Run simulated connection test
            </button>
            {tested && (
              <p role="status">
                Simulation passed. No external service was contacted.
              </p>
            )}
          </div>
        )}
        {step === 3 && (
          <fieldset>
            <legend>Systems available at this site</legend>
            <div className="site-setup-systems">
              {systemCatalog.map(({ id, name: label }) => (
                <label className="superadmin-checkbox" key={id}>
                  <input
                    type="checkbox"
                    checked={systemIds.includes(id)}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSystemIds((current) =>
                        checked
                          ? [...current, id]
                          : current.filter((item) => item !== id),
                      );
                    }}
                  />{" "}
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {step === 4 && (
          <dl className="site-setup-review">
            <div>
              <dt>Site</dt>
              <dd>
                {name.trim()} · {location.trim()}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{active ? "Active" : "Inactive"}</dd>
            </div>
            <div>
              <dt>Vendor and source</dt>
              <dd>
                {source === "sample"
                  ? "Nexus sample data · " +
                    workSites.find(({ id }) => id === sampleSiteId)?.name
                  : vendor.trim() + " · " + endpoint.trim()}
              </dd>
            </div>
            <div>
              <dt>Systems</dt>
              <dd>
                {systemCatalog
                  .filter(({ id }) => systemIds.includes(id))
                  .map(({ name: label }) => label)
                  .join(", ")}
              </dd>
            </div>
          </dl>
        )}
        {error && (
          <p className="site-setup-error" role="alert">
            {error}
          </p>
        )}
        <div className="site-setup-actions">
          {step > 0 && (
            <button
              type="button"
              className="superadmin-text-link"
              onClick={() => goTo(step - 1)}
            >
              Back
            </button>
          )}
          <button type="submit" className="superadmin-button">
            {step === steps.length - 1
              ? "Create site"
              : "Next: " + steps[step + 1]}
          </button>
        </div>
      </form>
    </section>
  );
}
