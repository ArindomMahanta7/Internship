"use client";

import Link from "next/link";
import { useState } from "react";
import AuthBrand from "../auth-brand";
import OAuthButtons from "../oauth-buttons";
import DropletBackdrop from "../droplet-backdrop";
import { PersonIcon, LockIcon, CheckIcon } from "../icons";
import "../auth.css";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (!identifier.trim() || !password) {
      setError("Please enter your email or phone number and password.");
      return;
    }

    setError(null);
    setSubmitting(true);
    // TODO: send the credentials to the auth API once the backend is ready.
  }

  return (
    <main className="buycart-page">
      <DropletBackdrop />
      <div className="buycart-shell">
        <AuthBrand />

        <section className="buycart-panel">
          <form className="buycart-form" onSubmit={handleSubmit} noValidate>
            <label className="buycart-field">
              <PersonIcon />
              <input
                type="text"
                name="identifier"
                placeholder="Email or Phone Number"
                autoComplete="username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </label>

            <label className="buycart-field">
              <LockIcon />
              <input
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? (
              <p className="buycart-error" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="buycart-btn buycart-btn--primary"
              disabled={submitting}
            >
              {submitting ? "Logging in…" : "Log In"}
            </button>

            <div className="buycart-row">
              <label className="buycart-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span className="buycart-check__box">
                  <CheckIcon />
                </span>
                Remember Me
              </label>

              <Link href="/forgot-password" className="buycart-link">
                Forgot Password?
              </Link>
            </div>

            <OAuthButtons />
          </form>
        </section>

        <p className="buycart-signup">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="buycart-link">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}
