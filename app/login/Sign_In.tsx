"use client";

import { demoEnabled } from "@/utils/demo-mode";
import { useState } from "react";
import type { FormEvent } from "react";
import { needsFirstPassword } from "./DemoEntry";
import { saveDemoSession } from "@/utils/demo-session";
import { useRouter } from "next/navigation";
import { getDemoProfile, login } from "@/data/credential";
import { Input } from "@/components/tailgrids/core/input";
import { Button } from "@/components/tailgrids/core/button";
import styles from "./Sign_In.module.css";

export default function SignIn() {
  if (!demoEnabled) {
    return (
      <main className="mx-auto max-w-lg p-6">
        <h1 className="text-2xl font-bold">Nexus Dashboard</h1>
        <p>Demo sign-in is disabled for this deployment.</p>
      </main>
    );
  }

  return <DemoSignIn />;
}

function DemoSignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [failure, setFailure] = useState<"expired" | "unavailable" | null>(
    null,
  );
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");

    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email")).trim().toLowerCase();
    const password = String(fields.get("password")).trim();
    if (!email || !password) {
      setError("Enter your work email and password.");
      return;
    }

    setPending(true);
    try {
      const loginEmail = email.includes("@") ? email : email + "@company.com";
      const credential = await login(loginEmail, password);

      if (needsFirstPassword(credential.email)) {
        router.replace("/login?demo=first-login");
        return;
      }

      // Sample outcomes are only rolled after the demo credentials pass.
      const roll = Math.random();
      if (roll < 0.25) {
        setFailure(roll < 0.15 ? "expired" : "unavailable");
        return;
      }

      saveDemoSession(credential);
      router.replace(
        getDemoProfile(credential.email)?.role === "Superadmin"
          ? "/superadmin"
          : "/login/sites",
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.introduction}
        aria-labelledby="workspace-heading"
      >
        <span className={styles.brand}>NEXUS</span>

        <div className={styles.introductionBody}>
          <h1 id="workspace-heading">
            One workspace.
            <br />
            Your entire operation.
          </h1>
          <p className={styles.description}>
            Monitor your spaces, systems, and safety
            <br className={styles.desktopBreak} /> from a single operations
            dashboard.
          </p>
          <ul className={styles.benefits}>
            <li>
              <span aria-hidden="true">✓</span>Live cameras and incident
              response
            </li>
            <li>
              <span aria-hidden="true">✓</span>Access control and smart alarms
            </li>
            <li>
              <span aria-hidden="true">✓</span>Parking and connected systems
            </li>
          </ul>
        </div>

        <p className={styles.introductionFooter}>
          Unified operations / The Nexus Dashboard
        </p>
      </section>

      <section className={styles.formPanel} aria-labelledby="sign-in-heading">
        <span className={styles.mobileBrand}>NEXUS</span>
        <div className={styles.signInCard}>
          {failure ? (
            <>
              <div className={styles.cardHeading} role="alert">
                <p className={styles.eyebrow}>DEMO SIGN-IN</p>
                <h2 id="sign-in-heading">
                  {failure === "expired"
                    ? "Sign-in link expired"
                    : "Access unavailable"}
                </h2>
                <p>
                  {failure === "expired"
                    ? "This sign-in link is no longer valid."
                    : "Your workspace could not be reached."}
                </p>
              </div>
              <Button
                type="button"
                className={styles.primaryButton}
                onPress={() => setFailure(null)}
              >
                Back to sign in
              </Button>
            </>
          ) : (
            <>
              <div className={styles.cardHeading}>
                <p className={styles.eyebrow}>WELCOME BACK</p>
                <h2 id="sign-in-heading">Sign in to Nexus</h2>
                <p>Enter your work account to continue.</p>
              </div>

              <form className={styles.form} onSubmit={handleLogin}>
                <div className={styles.field}>
                  <label htmlFor="email">Work email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="name@company.com"
                    className={styles.textInput}
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="password">Password</label>
                  <div className={styles.passwordField}>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className={styles.textInput}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {error && (
                  <p role="alert" className={styles.error}>
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={pending}
                >
                  {pending ? "Signing in…" : "Sign in"}
                </Button>
              </form>

              <div className={styles.divider}>
                <span />
                or
                <span />
              </div>
              <Button
                type="button"
                appearance="outline"
                className={styles.secondaryButton}
              >
                Continue with company SSO
              </Button>
              <p className={styles.accountHelp}>
                Need an account? Contact your administrator.
              </p>

              <nav aria-label="Legal links" className={styles.legalLinks}>
                <a href="#privacy">Privacy policy</a>
                <span aria-hidden="true">·</span>
                <a href="#terms">Terms</a>
                <span aria-hidden="true">·</span>
                <a href="#help">Help</a>
              </nav>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
