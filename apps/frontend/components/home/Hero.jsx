import Link from "next/link";
import PhoneArt from "./PhoneArt";
import { ArrowRightIcon } from "../icons";

/* Hero - the first thing the splash fades into. Two tilted phones on the
 * right, headline + CTAs + quick stats on the left. Static/server-rendered. */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__inner">
        <div className="hero__copy">
          <span className="hero__eyebrow">The phone marketplace</span>
          <h1 className="hero__title">
            Your next phone,
            <br />
            <span className="hero__accent">at the best price.</span>
          </h1>
          <p className="hero__subtitle">Latest phones from top brands.</p>

          <div className="hero__actions">
            <Link href="/products" className="hero__btn hero__btn--primary">
              Shop now
              <ArrowRightIcon />
            </Link>
            <Link href="/products" className="hero__btn hero__btn--ghost">
              View deals
            </Link>
          </div>

          <ul className="hero__stats">
            <li>
              <strong>50k+</strong>
              <span>Happy customers</span>
            </li>
            <li>
              <strong>120+</strong>
              <span>Phones</span>
            </li>
          </ul>
        </div>

        <div className="hero__visual" aria-hidden="true">
          <PhoneArt color="#2563eb" className="hero__phone hero__phone--back" />
          <PhoneArt color="#ec4899" className="hero__phone hero__phone--front" />
        </div>
      </div>
    </section>
  );
}
