import Link from "next/link";
import { brandFont } from "../auth/brand-font";
import { CartIcon, XIcon, InstagramIcon, FacebookIcon, YoutubeIcon } from "../icons";
import "./layout.css";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Mobiles", href: "/products" },
      { label: "Featured", href: "/products" },
      { label: "Deals", href: "/products" },
      { label: "Coming soon", href: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Press", href: "/" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/" },
      { label: "Shipping", href: "/" },
      { label: "Returns", href: "/" },
      { label: "Contact", href: "/" },
    ],
  },
];

const SOCIAL = [
  { label: "X", Icon: XIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "Facebook", Icon: FacebookIcon },
  { label: "YouTube", Icon: YoutubeIcon },
];

export default function Footer() {
  return (
    <footer className={`footer ${brandFont.variable}`}>
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <span className="footer__logo-mark">
              <CartIcon />
            </span>
            <span className="footer__name">BuyCart</span>
          </div>
          <p className="footer__tagline">
            Your trusted place to buy phones online — best prices, fast delivery and easy returns.
          </p>
          <div className="footer__social">
            {SOCIAL.map(({ label, Icon }) => (
              <a href="#" key={label} aria-label={label} className="footer__social-link">
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="footer__cols">
          {COLUMNS.map((col) => (
            <div className="footer__col" key={col.title}>
              <h4 className="footer__col-title">{col.title}</h4>
              <ul className="footer__list">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} BuyCart. All rights reserved.</span>
        <div className="footer__legal">
          <Link href="/">Privacy</Link>
          <Link href="/">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
