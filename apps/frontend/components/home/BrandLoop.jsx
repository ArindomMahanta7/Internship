import { BRANDS } from "../../data/products";
import BrandLogo from "../brands/BrandLogo";

/* Infinite logo marquee. The brand list is duplicated and the track slides by
 * -50%, so the loop is seamless. Pauses for reduced-motion users via CSS. */
export default function BrandLoop() {
  const loop = [...BRANDS, ...BRANDS];

  return (
    <section className="brands" aria-label="Brands we carry">
      <p className="brands__label">Shop top brands</p>
      <div className="brands__marquee">
        <div className="brands__track">
          {loop.map((brand, i) => (
            <span className="brands__item" key={`${brand}-${i}`}>
              <BrandLogo brand={brand} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
