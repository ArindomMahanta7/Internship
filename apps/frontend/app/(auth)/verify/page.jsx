"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "../../../components/auth/AuthForm";
import { MailIcon, LockIcon } from "../../../components/icons";
import { verifyOtp, resendOtp } from "../../../lib/api";

/* Verify (OTP) step. Registration hands off here with ?email=..., so the
 * form only needs the 6-digit code. Visiting /verify directly (bookmark,
 * back button) still works - it falls back to asking for the email too. */
export default function VerifyPage() {
  return (
    /* useSearchParams suspends under Cache Components. */
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams?.get("email") ?? "";
  const from = searchParams?.get("from") ?? "register";

  /* Resend state: `cooldown` counts down from 30 (matches the API's rate
   * limit) so the button can't be spammed; `notice`/`resendError` mirror the
   * API's reply under the button. */
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState(null);
  const [resendError, setResendError] = useState(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const fields = emailFromUrl
    ? [
        {
          name: "code",
          placeholder: "6-digit code",
          icon: LockIcon,
          autoComplete: "one-time-code",
          inputMode: "numeric",
        },
      ]
    : [
        {
          name: "email",
          type: "email",
          placeholder: "Email Address",
          icon: MailIcon,
          autoComplete: "email",
          inputMode: "email",
        },
        {
          name: "code",
          placeholder: "6-digit code",
          icon: LockIcon,
          autoComplete: "one-time-code",
          inputMode: "numeric",
        },
      ];

  function validate(values) {
    const email = (values.email ?? emailFromUrl).trim();
    if (!email) return "Please enter the email you signed up with.";
    if (!/^\d{6}$/.test(values.code.trim())) {
      return "Enter the 6-digit code from your email.";
    }
    return null;
  }

  /* POST /api/auth/verify-email. Once the account is verified there is no
   * session yet (register never logs you in), so the natural next step is
   * the login form - which confirms success and hands back `next`. */
  async function handleSubmit(values) {
    const email = (values.email ?? emailFromUrl).trim();
    await verifyOtp(email, values.code.trim());

    const next = searchParams?.get("next");
    const query = next ? `?verified=1&next=${encodeURIComponent(next)}` : "?verified=1";
    router.replace(`/login${query}`);
  }

  /* POST /api/auth/resend-otp - the escape hatch when the code expired
   * (5 min) or the email never showed up. If the account turns out to be
   * verified already, skip straight to the login form. */
  async function handleResend(email) {
    const trimmed = email.trim();
    if (!trimmed || sending || cooldown > 0) return;

    setSending(true);
    setResendError(null);
    setNotice(null);

    try {
      const data = await resendOtp(trimmed);
      if (data?.alreadyVerified) {
        router.replace("/login?verified=1");
        return;
      }
      setNotice(data?.message ?? "A new code is on its way.");
      setCooldown(30);
    } catch (error) {
      setResendError(error?.message ?? "Could not send a new code. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AuthForm
      fields={fields}
      submitLabel="Verify"
      submittingLabel="Verifying…"
      validate={validate}
      onSubmit={handleSubmit}
      footer={
        emailFromUrl ? (
          <>
            Wrong email?{" "}
            <Link href="/register" className="buycart-link">
              Start over
            </Link>
          </>
        ) : (
          <>
            Already verified?{" "}
            <Link href="/login" className="buycart-link">
              Log In
            </Link>
          </>
        )
      }
    >
      {/*
       * Children as a render function: the resend button needs the email the
       * visitor is currently typing when they arrived without ?email=.
       */}
      {(values) => {
        const email = (emailFromUrl || values.email || "").trim();

        return (
          <>
            {emailFromUrl ? (
              <p className="buycart-hint">
                We sent a 6-digit code to <strong>{emailFromUrl}</strong>. It
                expires in 5 minutes.
                {from === "login" ? (
                  <>
                    {" "}
                    <Link href="/register" className="buycart-link">
                      Use a different email
                    </Link>
                  </>
                ) : null}
              </p>
            ) : null}

            <p className="buycart-resend">
              Didn&apos;t get the code?{" "}
              <button
                type="button"
                className="buycart-link buycart-resend__btn"
                onClick={() => handleResend(email)}
                disabled={!email || sending || cooldown > 0}
              >
                {sending
                  ? "Sending…"
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend code"}
              </button>
            </p>

            {notice ? (
              <p className="buycart-success" role="status">
                {notice}
              </p>
            ) : null}
            {resendError ? (
              <p className="buycart-error" role="alert">
                {resendError}
              </p>
            ) : null}
          </>
        );
      }}
    </AuthForm>
  );
}
