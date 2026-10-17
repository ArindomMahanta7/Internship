import localFont from "next/font/local";

/* Grandover - used only for the "BuyCart" platform name.
 * Loaded from public/fonts and exposed as the --font-brand CSS variable. */
export const brandFont = localFont({
  src: "../../public/fonts/grandover-personal-use.regular.ttf",
  variable: "--font-brand",
  display: "swap",
  weight: "400",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});
