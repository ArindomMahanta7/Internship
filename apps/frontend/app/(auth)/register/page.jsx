"use client";

import Link from "next/link";
import { useState } from "react";
import AuthBrand from "../auth-brand";
import OAuthButtons from "../oauth-buttons";
import DropletBackdrop from "../droplet-backdrop";
import { PersonIcon, MailIcon, LockIcon, CheckIcon } from "../icons";
import "../auth.css";

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in every field.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("Please accept the Terms of Service to continue.");
      return;
    }

    setError(null);
    setSubmitting(true);
    // TODO: create the account via the auth API once the backend is ready,
    // then redirect to /verify (or straight to / on success).
  }

  return (
    <main className="buycart-page">
      <DropletBackdrop />
      <div className="buycart-shell">
        <AuthBrand />

        <section className="buycart-panel">
          <form className="buycart-form buycart-form--dense" onSubmit={handleSubmit} noValidate>
            <label className="buycart-field">
              <PersonIcon />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>

            <label className="buycart-field">
              <MailIcon />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="buycart-field">
              <LockIcon />
              <input
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <label className="buycart-field">
              <LockIcon />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
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
              {submitting ? "Creating Account…" : "Create Account"}
            </button>

            <label className="buycart-check buycart-check--top">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
              />
              <span className="buycart-check__box">
                <CheckIcon />
              </span>
              <span className="buycart-terms">
                I agree to the{" "}
                <Link href="/terms">Terms of Service</Link> and{" "}
                <Link href="/privacy">Privacy Policy</Link>
              </span>
            </label>

            <OAuthButtons />
          </form>
        </section>

        <p className="buycart-signup">
          Already have an account?{" "}
          <Link href="/login" className="buycart-link">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}
