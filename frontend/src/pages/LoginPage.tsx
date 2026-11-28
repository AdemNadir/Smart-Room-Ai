import { useState, type FormEvent } from "react";
import { Navigate, useLocation } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { ApiError, IS_DEMO } from "@/api";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/api/mock/users";
import { useAuth } from "@/auth/AuthContext";
import { homeFor } from "@/auth/guards";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Logo } from "@/components/ui/Logo";
import { Surface } from "@/components/ui/Surface";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import styles from "./LoginPage.module.css";

/**
 * The specific in-app page the visitor was heading to before being sent to sign in.
 * Never an external address, and never the bare "/" (that is only the default entry point,
 * so the person should land on their own role's home instead).
 */
function returnPathFrom(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from;
  const isInternal = typeof from === "string" && from.startsWith("/") && !from.startsWith("//");
  return isInternal && from !== "/" && from !== "/login" ? from : null;
}

export function LoginPage() {
  useDocumentTitle("Sign in");
  const { user, login } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One place decides where a signed-in person goes: back to the page they asked
  // for, otherwise their role's home. Signing in only updates the user; this redirect does the rest.
  if (user) return <Navigate to={returnPathFrom(location.state) ?? homeFor(user)} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  return (
    <div className={styles.page}>
      <div className={styles.column}>
        <div className={styles.brand}>
          <Logo size={52} />
          <h1>Smart Room</h1>
          <p>Sign in to find and book a classroom.</p>
        </div>

        <Surface as="form" padding="lg" className={styles.form} onSubmit={onSubmit} noValidate>
          {error && (
            <p className={styles.alert} role="alert">
              {error}
            </p>
          )}
          <Field
            label="University email"
            type="email"
            name="email"
            autoComplete="username"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Field
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
              <button
                type="button"
                className={styles.reveal}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={19} aria-hidden /> : <Eye size={19} aria-hidden />}
              </button>
            }
          />
          <Button type="submit" size="lg" block loading={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </Surface>

        {IS_DEMO && (
          <div className={styles.demo}>
            <p>Demo data only. Choose an account to fill the form.</p>
            <div className={styles.chips}>
              {DEMO_ACCOUNTS.map((account) => (
                <button key={account.id} type="button" className={styles.chip} onClick={() => fillDemo(account.email)}>
                  {account.hint}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
