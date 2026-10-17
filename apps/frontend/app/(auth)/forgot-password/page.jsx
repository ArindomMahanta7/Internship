"use client";

import Link from "next/link";
import AuthForm from "../../../components/auth/AuthForm";
import { PersonIcon } from "../../../components/icons";

/* Forgot-password. Uses the shared auth chrome so it matches login/register;
 * submits a reset request (placeholder) until the auth API is wired up. */
export default function ForgotPasswordPage() {
  async function handleSubmit(values) {
    // TODO: send the reset link via the auth API once the backend is ready.
    void values;
  }

  return (
    <AuthForm
      fields={[
        {
          name: "identifier",
          placeholder: "Email or Phone Number",
          icon: PersonIcon,
          autoComplete: "username",
        },
      ]}
      submitLabel="Send Reset Link"
      submittingLabel="Sending…"
      onSubmit={handleSubmit}
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="buycart-link">
            Back to Log In
          </Link>
        </>
      }
    />
  );
}
