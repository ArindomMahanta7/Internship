/* Wordmark "logos" for the brands BuyCart carries.
 *
 * These are clean, recognizable SVG wordmarks rendered in `currentColor` so the
 * brand strip stays cohesive on the dark theme (the Samsung one keeps its
 * signature ellipse). Swap any of these for official brand assets later by
 * dropping an <img> in place - the sizing is handled in layout.css.
 */

export const BRAND_NAMES = ["Nokia", "Samsung", "realme", "Redmi", "Micromax", "OnePlus", "Apple", "Google"];

const FONT = "Arial, Helvetica, sans-serif";

export default function BrandLogo({ brand, className = "" }) {
  const common = {
    className: `brand-logo ${className}`.trim(),
    role: "img",
    "aria-label": brand,
    fill: "currentColor",
  };

  switch (brand) {
    case "Samsung":
      return (
        <svg viewBox="0 0 200 56" {...common}>
          <ellipse cx="100" cy="28" rx="95" ry="24" fill="none" stroke="currentColor" strokeWidth="3" />
          <text x="100" y="37" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="25" letterSpacing="1.5">
            SAMSUNG
          </text>
        </svg>
      );
    case "Nokia":
      return (
        <svg viewBox="0 0 150 56" {...common}>
          <text x="75" y="39" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="33" letterSpacing="2">
            NOKIA
          </text>
        </svg>
      );
    case "realme":
      return (
        <svg viewBox="0 0 175 56" {...common}>
          <text x="87" y="39" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="35">
            realme
          </text>
        </svg>
      );
    case "Redmi":
      return (
        <svg viewBox="0 0 150 56" {...common}>
          <text x="75" y="39" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="33">
            Redmi
          </text>
        </svg>
      );
    case "Micromax":
      return (
        <svg viewBox="0 0 215 56" {...common}>
          <text x="107" y="38" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="30" letterSpacing="0.5">
            micromax
          </text>
        </svg>
      );
    case "OnePlus":
      return (
        <svg viewBox="0 0 200 56" {...common}>
          <text x="60" y="39" textAnchor="middle" fontFamily={FONT} fontWeight="800" fontSize="33">
            1+
          </text>
          <text x="132" y="37" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="25" letterSpacing="1">
            OnePlus
          </text>
        </svg>
      );
    case "Apple":
      return (
        <svg viewBox="0 0 175 56" {...common}>
          <text x="87" y="39" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="31" letterSpacing="1">
            Apple
          </text>
        </svg>
      );
    case "Google":
      return (
        <svg viewBox="0 0 185 56" {...common}>
          <text x="92" y="39" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="31" letterSpacing="1">
            Google
          </text>
        </svg>
      );
    default:
      return null;
  }
}
