/* Generic button used across the app.
 * `variant` maps to the visual styles in auth.css:
 *   "primary" - the solid blue call-to-action
 *   "oauth"   - the translucent social sign-in button
 *
 * Pass `loading` to disable the button and swap in a spinner + label.
 * All other props (onClick, type, className, ...) are forwarded to <button>. */

import Loader from "./Loader";

const VARIANT_CLASS = {
  primary: "buycart-btn--primary",
  oauth: "buycart-btn--oauth",
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled = false,
  loadingLabel = null,
  className = "",
  children,
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`buycart-btn ${VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader className="buycart-btn__loader" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
