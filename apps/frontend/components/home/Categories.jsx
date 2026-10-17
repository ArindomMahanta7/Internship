import Link from "next/link";
import { SmartphoneIcon, ClockIcon, ArrowRightIcon } from "../icons";

/* Two category cards: a live "Mobiles" card that links to the catalog, and a
 * muted "Coming soon" placeholder for categories we haven't launched yet. */
export default function Categories() {
  return (
    <section className="section categories">
      <div className="section__head">
        <h2 className="section__title">Shop by category</h2>
        <p className="section__sub">Everything phone, in one place.</p>
      </div>

      <div className="categories__grid">
        <Link href="/products" className="cat-card cat-card--live">
          <div className="cat-card__icon">
            <SmartphoneIcon />
          </div>
          <div className="cat-card__body">
            <h3 className="cat-card__title">Mobiles</h3>
            <p className="cat-card__text">The latest smartphones from every major brand.</p>
            <span className="cat-card__cta">
              Browse mobiles
              <ArrowRightIcon />
            </span>
          </div>
          <span className="cat-card__count">120+ models</span>
        </Link>

        <div className="cat-card cat-card--soon" aria-disabled="true">
          <div className="cat-card__icon">
            <ClockIcon />
          </div>
          <div className="cat-card__body">
            <h3 className="cat-card__title">Coming soon</h3>
            <p className="cat-card__text">Wearables, audio and accessories are on the way.</p>
            <span className="cat-card__cta">Stay tuned</span>
          </div>
          <span className="cat-card__pill">Upcoming</span>
        </div>
      </div>
    </section>
  );
}
