"use client";

import Link from "next/link";
import AuthForm from "../../../components/auth/AuthForm";
import { LockIcon } from "../../../components/icons";

/* Verify (OTP) step. Uses the shared auth chrome so it matches login/register;
 * the field is a placeholder until the verification API is wired up. */
export default function VerifyPage() {
  async function handleSubmit(values) {
    // TODO: verify the code against the auth API once the backend is ready.
    void values;
  }

  return (
    <AuthForm
      fields={[
        {
          name: "code",
          placeholder: "6-digit code",
          icon: LockIcon,
          autoComplete: "one-time-code",
          inputMode: "numeric",
        },
      ]}
      submitLabel="Verify"
      submittingLabel="Verifying…"
      onSubmit={handleSubmit}
      footer={
        <>
          Wrong number?{" "}
          <Link href="/register" className="buycart-link">
            Start over
          </Link>
        </>
      }
    />
  );
}
