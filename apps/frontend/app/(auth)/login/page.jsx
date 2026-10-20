"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthForm from "../../../components/auth/AuthForm";
import { PersonIcon, LockIcon, CheckIcon } from "../../../components/icons";
import { ApiError } from "../../../lib/api";
import { signIn } from "../../../lib/auth";

export default function LoginPage() {
  return (
    /* useSearchParams suspends under Cache Components. */
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [remember, setRemember] = useState(true);
  // Set when we land here straight from a successful OTP verification.
  const justVerified = searchParams?.get("verified") === "1";

  function validate(values) {
    if (!values.identifier.trim() || !values.password) {
      return "Please enter your email or phone number and password.";
    }
    return null;
  }

  /* POST /api/auth/login. On success the API sets an HTTP-only `token`
   * cookie, so all we do is send the visitor where they were headed (the
   * `next` param, defaulting to the storefront). A 403 means the account
   * exists but the email OTP was never completed - hand them to /verify. */
  async function handleSubmit(values) {
    const identifier = values.identifier.trim();

    try {
      await signIn(identifier, values.password);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        router.push(`/verify?email=${encodeURIComponent(identifier)}&from=login`);
        return;
      }
      throw error; // AuthForm shows this message.
    }

    const next = searchParams?.get("next");
    router.replace(next && next.startsWith("/") ? next : "/");
    // Refresh so the navbar re-reads /api/auth/me with the new cookie.
    router.refresh();
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
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          icon: LockIcon,
          autoComplete: "current-password",
        },
      ]}
      submitLabel="Log In"
      submittingLabel="Logging in…"
      validate={validate}
      onSubmit={handleSubmit}
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="buycart-link">
            Sign Up
          </Link>
        </>
      }
    >
      {justVerified ? (
        <p className="buycart-success" role="status">
          Email verified — log in to start shopping.
        </p>
      ) : null}

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
    </AuthForm>
  );
}
