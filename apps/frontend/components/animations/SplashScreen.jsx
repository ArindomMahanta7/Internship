"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { brandFont } from "../auth/brand-font";
import "./splash.css";

/* BuyCart intro animation.
 *
 *   Scene 1 - The Slide       the cart flies in from the left and stops at center
 *   Scene 2 - The Catch       phones fall into the waiting cart; each bounces on landing
 *   Scene 3 - The Reveal      phones collapse in; the loaded cart rises and *becomes*
 *                             the logo badge (it shrinks onto the glyph while the blue
 *                             mark pops in around it), then the wordmark unfurls
 *   Scene 4 - Enter           the overlay fades out and `onComplete` fires
 *
 * Usage:
 *   <SplashScreen onComplete={() => setDone(true)} />
 *
 * Robustness notes:
 *   - Initial states are added with `tl.set(..., 0)` *inside* the timeline, not
 *     with a bare `gsap.set()`. That way the starting pose is applied on play
 *     and fully undone by `tl.kill()` - so React Strict Mode's
 *     mount -> cleanup -> remount cycle can't strand the elements mid-state.
 *   - The cart's landing spot inside the badge is measured at runtime
 *     (getBoundingClientRect) so the flying cart lines up with the logo glyph
 *     at any viewport size - the morph is pixel-accurate, not a hardcoded offset.
 *   - The timeline is stored in a ref and killed on cleanup. No gsap.context(),
 *     so there's no revert() to fight the double-invoke.
 *   - A failsafe timer guarantees `onComplete` still fires even if the ticker
 *     is throttled, so the splash can never wedge itself on screen.
 *   - Positions are deterministic constants (not Math.random), so the server
 *     and client render identically.
 *   - The whole sequence is skipped for prefers-reduced-motion users, who just
 *     see the logo before a quick fade.
 */

/* Deterministic per-phone drop configs: horizontal spread, fall speed, spin.
 * Two phones, kept near the center so both land inside the cart. */
const PHONES = [
  { x: -20, delay: 0.05, duration: 1.15, rotation: -8, fromRotation: 25 },
  { x: 55, delay: 0.2, duration: 0.9, rotation: 20, fromRotation: -45 },
];

/* Tinted screens so the falling phones read as distinct little devices. */
const SCREENS = [
  ["#0ea5e9", "#22d3ee"],
  ["#2563eb", "#3b82f6"],
];

/* Target runtime of the splash in seconds. The timeline is built in "base"
 * time, then scaled to hit this exactly via tl.timeScale() - so every beat
 * (slide, falls, bounces, reveal) stretches uniformly and the feel is preserved. */
const TOTAL_DURATION = 6;

function CartSvg({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 3a1 1 0 0 0 0 2h1.4a1 1 0 0 1 .95.68L6.2 9.6a2.4 2.4 0 0 0 2.26 1.6h8.9a1 1 0 0 1 .95.68l1.5 4.4a1.6 1.6 0 0 1-1.52 2.12H8.44a2.4 2.4 0 0 1-2.26-1.6L4.4 12H3.4"
        stroke="#93c5fd"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.6" fill="#93c5fd" />
      <circle cx="17.5" cy="20" r="1.6" fill="#93c5fd" />
    </svg>
  );
}

export default function SplashScreen({ onComplete }) {
  const overlayRef = useRef(null);
  const cartRef = useRef(null);
  const logoRef = useRef(null);
  const logoMarkRef = useRef(null);
  const logoWordRef = useRef(null);
  const phoneRefs = useRef([]);

  // Keep the latest onComplete in a ref so the effect below never has to
  // re-run (and never restarts the timeline) when a parent re-renders with a
  // fresh inline arrow function.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const cart = cartRef.current;
    const logo = logoRef.current;
    const logoMark = logoMarkRef.current;
    const logoWord = logoWordRef.current;
    const phones = phoneRefs.current.filter(Boolean);

    // If the refs aren't all present we can't animate. Log loudly in dev so a
    // regression here is obvious instead of showing as a frozen screen.
    if (!overlay || !cart || !logo || !logoMark || !logoWord) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[SplashScreen] missing refs; animation skipped.", {
          overlay: Boolean(overlay),
          cart: Boolean(cart),
          logo: Boolean(logo),
          logoMark: Boolean(logoMark),
          logoWord: Boolean(logoWord),
        });
      }
      onCompleteRef.current?.();
      return undefined;
    }

    const finish = () => {
      onCompleteRef.current?.();
    };

    // Reduced motion: skip the choreography, show the logo briefly, fade out.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(phones, { opacity: 0 });
      gsap.set(cart, { opacity: 0 });
      gsap.set(logo, { opacity: 1 });
      gsap.set(logoMark, { opacity: 1, scale: 1 });
      gsap.set(logoWord, { opacity: 1, y: 0, filter: "blur(0px)" });
      const t = window.setTimeout(() => {
        gsap.to(overlay, { opacity: 0, duration: 0.4, onComplete: finish });
      }, 700);
      return () => window.clearTimeout(t);
    }

    // --- Measure where the flying cart must land so it becomes the logo -----
    // The logo block and cart are both centered in the stage; the mark's cart
    // glyph sits above center. We measure the real pixel offset so the morph
    // lines up regardless of viewport size or wordmark height.
    const cartRect = cart.getBoundingClientRect();
    const markRect = logoMark.getBoundingClientRect();
    const markSvg = logoMark.querySelector("svg");
    const markSvgWidth = markSvg ? markSvg.getBoundingClientRect().width : 0;
    const dx = markRect.left + markRect.width / 2 - (cartRect.left + cartRect.width / 2);
    const dy = markRect.top + markRect.height / 2 - (cartRect.top + cartRect.height / 2);
    // Shrink the 240px cart down to the badge glyph's size for a seamless swap.
    const morphScale = cartRect.width > 0 && markSvgWidth > 0 ? markSvgWidth / cartRect.width : 68 / 240;
    // Start fully off-screen to the left (half viewport + cart width + buffer).
    const startX = -(window.innerWidth / 2 + 200);

    // One timeline; everything (including the starting pose) lives inside it.
    const tl = gsap.timeline({ onComplete: finish });

    // --- Scene 0: starting pose, applied at time 0 ------------------------
    tl.set(cart, { x: startX, y: 0, opacity: 1, scale: 0.9 }, 0);
    tl.set(logo, { opacity: 1 }, 0); // container visible; children hidden below
    tl.set(logoMark, { opacity: 0, scale: 0.55 }, 0);
    tl.set(logoWord, { opacity: 0, y: 28, filter: "blur(12px)" }, 0);
    phones.forEach((phone, i) => {
      const cfg = PHONES[i] ?? PHONES[0];
      tl.set(phone, { x: cfg.x, y: "-45vh", opacity: 0, rotation: cfg.fromRotation }, 0);
    });

    // --- Scene 1: the cart slides in from the left and stops at center -----
    tl.to(cart, { x: 0, scale: 1, duration: 1.05, ease: "power3.out" }, 0);

    // --- Scene 2: phones drop into the waiting cart and bounce -------------
    phones.forEach((phone, i) => {
      const cfg = PHONES[i] ?? PHONES[0];
      const dropStart = 0.7 + cfg.delay;
      const land = dropStart + cfg.duration; // when this phone reaches the cart

      tl.to(phone, { y: 0, opacity: 1, rotation: cfg.rotation, duration: cfg.duration, ease: "power2.in" }, dropStart);
      tl.to(phone, { y: -16, duration: 0.12, ease: "power2.out" }, land);
      tl.to(phone, { y: 0, duration: 0.28, ease: "bounce.out" }, land + 0.12);
    });

    const collectedAt = 2.65; // after the last bounce

    // --- Scene 3: phones collapse into the cart ---------------------------
    tl.to(phones, { y: 10, x: 0, scale: 0.2, opacity: 0, rotation: 0, duration: 0.5, ease: "power2.in", stagger: 0.03 }, collectedAt);

    // The loaded cart rises and shrinks onto the badge's cart glyph...
    tl.to(cart, { x: dx, y: dy, scale: morphScale, duration: 0.85, ease: "power2.inOut" }, collectedAt + 0.15);

    // ...the blue mark pops in around it (the cart "makes" the logo)...
    tl.to(logoMark, { opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.6)" }, collectedAt + 0.85);

    // ...and the flying cart cross-fades out exactly as the badge finishes.
    tl.to(cart, { opacity: 0, duration: 0.4, ease: "power1.out" }, collectedAt + 1.0);

    // Wordmark reveals beneath the newly-formed badge.
    tl.to(logoWord, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.75, ease: "power3.out" }, collectedAt + 1.45);

    // --- Scene 4: fade into the site ---------------------------------------
    tl.to(overlay, { opacity: 0, duration: 0.7, ease: "power2.inOut" }, collectedAt + 2.5);

    // Stretch/squash the whole sequence to exactly TOTAL_DURATION seconds.
    // timeScale scales every tween uniformly, so the relative pacing (slide,
    // falls, bounces, reveal) is preserved - it just runs slower/faster overall.
    const baseDuration = tl.duration();
    if (baseDuration > 0) {
      tl.timeScale(baseDuration / TOTAL_DURATION);
    }

    // Belt-and-braces: guarantee forward motion even if the tab was
    // backgrounded (rAF throttled) or the ticker got stuck.
    tl.play(0);

    // Failsafe: if the timeline somehow never completes, force the fade+finish
    // so the splash can't stay on screen forever. Scaled +buffer so it can't
    // fire before a legitimately-slowed timeline finishes.
    const failsafe = window.setTimeout(() => {
      if (!tl.progress() || tl.progress() < 1) {
        tl.kill();
        gsap.to(overlay, { opacity: 0, duration: 0.4, onComplete: finish });
      }
    }, (TOTAL_DURATION + 2) * 1000);

    return () => {
      window.clearTimeout(failsafe);
      tl.kill();
      // Undo any inline styles this run applied so a remount starts clean.
      gsap.set([overlay, cart, logo, logoMark, logoWord, ...phones], { clearProps: "all" });
    };
    // Run once on mount. onComplete is read via ref, so re-renders won't
    // restart the timeline.
  }, []);

  return (
    <div className="splash-overlay" ref={overlayRef} role="status" aria-label="BuyCart is loading">
      <div className="splash-stage">
        {PHONES.map((cfg, i) => (
          <div
            key={i}
            className="splash-phone"
            ref={(el) => {
              phoneRefs.current[i] = el;
            }}
          >
            <div className="splash-phone__body">
              <div
                className="splash-phone__screen"
                style={{
                  "--screen-a": SCREENS[i][0],
                  "--screen-b": SCREENS[i][1],
                }}
              >
                <span className="splash-phone__notch" />
              </div>
            </div>
          </div>
        ))}

        <div className="splash-cart" ref={cartRef}>
          <CartSvg className="splash-cart__svg" />
        </div>

        <div className={`splash-logo ${brandFont.variable}`} ref={logoRef}>
          <div className="splash-logo__mark" ref={logoMarkRef}>
            <CartSvg />
          </div>
          <h1 className="splash-logo__word" ref={logoWordRef}>
            BuyCart
          </h1>
        </div>
      </div>
    </div>
  );
}
