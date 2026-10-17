import { brandFont } from "./brand-font";

/* The BuyCart wordmark shown above the auth forms. */
export default function AuthBrand() {
  return (
    <header className={`buycart-brand ${brandFont.variable}`}>
      <h1 className="buycart-title">BuyCart</h1>
    </header>
  );
}
