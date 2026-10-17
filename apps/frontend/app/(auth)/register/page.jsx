"use client";

import Link from "next/link";
import { useState } from "react";
import AuthForm from "../../../components/auth/AuthForm";
import { PersonIcon, MailIcon, LockIcon, CheckIcon } from "../../../components/icons";

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const [agreed, setAgreed] = useState(false);

  function validate(values) {
    if (!values.fullName.trim() || !values.email.trim() || !values.password || !values.confirmPassword) {
      return "Please fill in every field.";
    }

    if (values.password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
    }

    if (values.password !== values.confirmPassword) {
      return "Passwords do not match.";
    }

    if (!agreed) {
      return "Please accept the Terms of Service to continue.";
    }

    return null;
  }

  async function handleSubmit(values) {
    // TODO: create the account via the auth API once the backend is ready,
    // then redirect to /verify (or straight to / on success).
    void values;
  }

  return (
    <AuthForm
      dense
      fields={[
        {
          name: "fullName",
          placeholder: "Full Name",
          icon: PersonIcon,
          autoComplete: "name",
        },
        {
          name: "email",
          type: "email",
          placeholder: "Email Address",
          icon: MailIcon,
          autoComplete: "email",
          inputMode: "email",
        },
        {
          name: "password",
          type: "password",
          placeholder: "Password",
          icon: LockIcon,
          autoComplete: "new-password",
        },
        {
          name: "confirmPassword",
          type: "password",
          placeholder: "Confirm Password",
          icon: LockIcon,
          autoComplete: "new-password",
        },
      ]}
      submitLabel="Create Account"
      submittingLabel="Creating Account…"
      validate={validate}
      onSubmit={handleSubmit}
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="buycart-link">
            Log In
          </Link>
        </>
      }
    >
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
    </AuthForm>
  );
}
