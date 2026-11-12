"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/data/credential";
import { getUserAccess } from "@/utils/user-store";
import { getSafeReturnPath, saveDemoSession } from "@/utils/demo-session";
import { Input } from "@/components/tailgrids/core/input";
import { Button } from "@/components/tailgrids/core/button";
import styles from "./Sign_In.module.css";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const handleLogin = async () => {
    const emailDom = document.getElementById("email") as HTMLInputElement;
    const passwordDom = document.getElementById("password") as HTMLInputElement;
    const email = emailDom.value.trim();
    const password = passwordDom.value.trim();
    if (email === "") {
      alert("Error: Email is required");
      return;
    }
    if (password === "") {
      alert("Error: Password is required");
      return;
    }
    const loginEmail = email.includes("@") ? email : `${email}@company.com`;
    try {
      const credential = await login(loginEmail, password);
      saveDemoSession(credential);
      const returnPath = getSafeReturnPath(
        credential.role,
        localStorage.getItem("returnPath"),
        getUserAccess(credential.email),
      );
      localStorage.removeItem("returnPath");
      router.replace(returnPath);
      router.refresh();
    } catch (error) {
      passwordDom.value = "";

      if (error instanceof Error && error.message === "Invalid password") {
        alert("Password incorrect.");
      } else {
        emailDom.value = "";
        alert(error instanceof Error ? error.message : "Unable to sign in.");
      }
    }
  };

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
          <div className={styles.cardHeading}>
            <p className={styles.eyebrow}>WELCOME BACK</p>
            <h2 id="sign-in-heading">Sign in to Nexus</h2>
            <p>Enter your work account to continue.</p>
          </div>

          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              handleLogin();
            }}
          >
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className={styles.formOptions}>
              <label className={styles.rememberMe}>
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#forgot-password">Forgot password?</a>
            </div>

            <Button type="submit" className={styles.primaryButton}>
              Sign in
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
        </div>
      </section>
    </main>
  );
}
