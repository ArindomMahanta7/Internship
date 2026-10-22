"use client";

import { useId, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import AuthBrand from "./AuthBrand";
import DropletBackdrop from "./DropletBackdrop";
import OAuthButton, { OAuthDivider } from "./OAuthButton";
import "./auth.css";

/* The shared BuyCart auth form: droplet backdrop, wordmark, frosted panel,
 * fields, submit button, an optional slot for page-specific extras, and the
 * social sign-in buttons.
 *
 * Login and register both render this - they only supply their own fields,
 * labels, and submit logic.
 *
 * Props
 *   fields         array of { name, type, placeholder, icon, autoComplete, inputMode }
 *                  `name` is the key used in the values object passed to onSubmit.
 *   submitLabel    button text at rest
 *   submittingLabel button text while the submit promise is pending
 *   validate       optional (values) => string|null - return an error message to
 *                  block submission, or null to allow it.
 *   onSubmit       (values) => Promise - thrown/rejected errors become the
 *                  visible error message.
 *   footer         node rendered under the panel (e.g. "Don't have an account?")
 *   dense          tighter field spacing, for forms with 4+ fields
 *   children       extra nodes rendered after the submit button, before the
 *                  social buttons (e.g. remember-me row, terms checkbox).
 *                  May also be a function (values) => node, for content that
 *                  needs the live form state (e.g. the resend-code control
 *                  on /verify, which reads the email being typed).
 */
export default function AuthForm({
  fields,
  submitLabel,
  submittingLabel,
  validate,
  onSubmit,
  footer,
  dense = false,
  children,
}) {
  const formId = useId();
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((field) => [field.name, ""]))
  );
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validate?.(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (submissionError) {
      setError(submissionError?.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="buycart-page">
      <DropletBackdrop />
      <div className="buycart-shell">
        <AuthBrand />

        <section className="buycart-panel">
          <form
            className={`buycart-form ${dense ? "buycart-form--dense" : ""}`.trim()}
            onSubmit={handleSubmit}
            noValidate
          >
            {fields.map((field) => (
              <Input
                key={field.name}
                id={`${formId}-${field.name}`}
                icon={field.icon}
                label={field.placeholder}
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                value={values[field.name]}
                onChange={(event) => setValue(field.name, event.target.value)}
              />
            ))}

            {error ? (
              <p className="buycart-error" role="alert">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              loadingLabel={submittingLabel}
            >
              {submitLabel}
            </Button>

            {typeof children === "function" ? children(values) : children}

            <OAuthDivider />
            <OAuthButton provider="apple" disabled={submitting} />
            <OAuthButton provider="google" disabled={submitting} />
          </form>
        </section>

        {footer ? <p className="buycart-signup">{footer}</p> : null}
      </div>
    </main>
  );
}
