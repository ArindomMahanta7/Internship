"use client";

import Button from "../ui/Button";
import { AppleIcon, GoogleIcon } from "../icons";

/* A single social sign-in button.
 *
 *   provider - "apple" | "google"  (drives the icon + label)
 *   onClick  - handler; receives the provider name so one function can
 *              serve every button:  onClick={(provider) => signIn(provider)}
 *
 * Renders inside the form as type="button" so it never submits the form.
 * Swap the handler for the real OAuth call once the backend is ready.
 */

const PROVIDERS = {
  apple: {
    label: "Continue with Apple",
    Icon: AppleIcon,
    // The Apple glyph needs to stay dark-on-light / light-on-dark per platform;
    // our buttons are dark, so we force the light fill.
    iconClassName: "buycart-btn__icon--apple",
  },
  google: {
    label: "Continue with Google",
    Icon: GoogleIcon,
    iconClassName: "",
  },
};

export default function OAuthButton({ provider, onClick, disabled = false }) {
  const config = PROVIDERS[provider];

  if (!config) {
    // Fail loudly in dev rather than silently rendering a broken button.
    throw new Error(
      `OAuthButton: unknown provider "${provider}". Expected one of ${Object.keys(PROVIDERS).join(", ")}.`
    );
  }

  const { label, Icon, iconClassName } = config;

  return (
    <Button
      variant="oauth"
      type="button"
      disabled={disabled}
      onClick={() => onClick?.(provider)}
    >
      <span className={`buycart-btn__icon ${iconClassName}`.trim()}>
        <Icon />
      </span>
      {label}
    </Button>
  );
}

/* The "or" divider shown above the social buttons. Kept here so any screen
 * that renders OAuthButtons gets a matching divider for free. */
export function OAuthDivider() {
  return (
    <div className="buycart-divider">
      <span>or</span>
    </div>
  );
}
