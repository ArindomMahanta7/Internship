"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "../../../components/auth/AuthForm";
import { MailIcon, LockIcon } from "../../../components/icons";
import { verifyOtp } from "../../../lib/api";

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
      {emailFromUrl ? (
        <p className="buycart-hint">
          We sent a 6-digit code to <strong>{emailFromUrl}</strong>. It expires in
          5 minutes.
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
    </AuthForm>
  );
}
