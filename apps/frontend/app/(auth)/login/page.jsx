"use client";

import Link from "next/link";
import { useState } from "react";
import AuthForm from "../../../components/auth/AuthForm";
import { PersonIcon, LockIcon, CheckIcon } from "../../../components/icons";

export default function LoginPage() {
  const [remember, setRemember] = useState(true);

  function validate(values) {
    if (!values.identifier.trim() || !values.password) {
      return "Please enter your email or phone number and password.";
    }
    return null;
  }

  async function handleSubmit(values) {
    // TODO: send the credentials to the auth API once the backend is ready.
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
