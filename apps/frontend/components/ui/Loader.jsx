/* Small indeterminate spinner. Inherits `currentColor` so it matches whatever
 * text/button it sits inside. Sized via the `size` prop (px). */

export default function Loader({ size = 18, className = "" }) {
  return (
    <svg
      className={`buycart-loader ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
