"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { brandFont } from "../auth/brand-font";
import { CartIcon, BagIcon, SearchIcon, MenuIcon, CloseIcon, PersonIcon } from "../icons";
import "./layout.css";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
];

/* Sticky glass navbar: brand, primary links, search, cart and auth. The search
 * box submits to /products?q=..., and on small screens the links collapse into
 * a toggleable panel. */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    setOpen(false);
    router.push(term ? `/products?q=${encodeURIComponent(term)}` : "/products");
  };

  return (
    <header className={`nav ${brandFont.variable}`}>
      <div className="nav__inner">
        <Link href="/" className="nav__brand" onClick={() => setOpen(false)}>
          <span className="nav__logo">
            <CartIcon />
          </span>
          <span className="nav__name">BuyCart</span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav__link${pathname === link.href ? " is-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form className="nav__search" onSubmit={submitSearch} role="search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search phones…"
            aria-label="Search products"
          />
        </form>

        <div className="nav__actions">
          <Link href="/cart" className="nav__cart" aria-label="Cart, 0 items">
            <BagIcon />
            <span className="nav__badge">0</span>
          </Link>

          <Link href="/login" className="nav__auth">
            <PersonIcon />
            <span>Log in</span>
          </Link>

          <button
            type="button"
            className="nav__toggle"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="nav__mobile">
          <form className="nav__mobile-search" onSubmit={submitSearch} role="search">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search phones…"
              aria-label="Search products"
            />
          </form>
          <nav className="nav__mobile-links" aria-label="Mobile">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={pathname === link.href ? "is-active" : ""}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)}>
              Cart
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}>
              Log in / Sign up
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
