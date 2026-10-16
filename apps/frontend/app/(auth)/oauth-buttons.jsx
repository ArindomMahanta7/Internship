"use client";

import { AppleIcon, GoogleIcon } from "./icons";

/* "Continue with Apple" / "Continue with Google".
 * Wire up the real OAuth flows by swapping the button for a Link/button
 * that calls your sign-in handler. */
export default function OAuthButtons() {
  return (
    <>
      <div className="buycart-divider">
        <span>or</span>
      </div>

      <button
        type="button"
        className="buycart-btn buycart-btn--oauth"
        // TODO: trigger the Apple sign-in flow
      >
        <span className="buycart-btn__icon buycart-btn__icon--apple">
          <AppleIcon />
        </span>
        Continue with Apple
      </button>

      <button
        type="button"
        className="buycart-btn buycart-btn--oauth"
        // TODO: trigger the Google sign-in flow
      >
        <span className="buycart-btn__icon">
          <GoogleIcon />
        </span>
        Continue with Google
      </button>
    </>
  );
}
