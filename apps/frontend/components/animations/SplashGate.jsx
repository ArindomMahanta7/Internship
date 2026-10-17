"use client";

import { useState, useSyncExternalStore } from "react";
import SplashScreen from "./SplashScreen";

/* One-time intro gate.
 *
 * The site (`children`) is always rendered; the SplashScreen intro is layered
 * on top (it's a fixed, opaque, full-screen overlay). When the intro finishes
 * - or if this browser session has already seen it - the overlay is removed,
 * revealing the page that was ready underneath.
 *
 * Why children render behind the overlay:
 *   - Scene 4 fades the overlay out to "reveal the homepage". With the page
 *     already mounted underneath, that fade lands on real content instead of
 *     a blank frame.
 *   - Nothing is delayed by the ~6s intro; the site is interactive the moment
 *     the overlay clears.
 *
 * Replay behavior:
 *   - `sessionStorage` marks the intro as seen, so it plays once per browser
 *     tab session. Open a new tab (or a private window) to see it again - a
 *     plain reload in the same tab won't replay it.
 *
 * Reading the "seen" flag with useSyncExternalStore (not a setState in an
 * effect):
 *   - sessionStorage is an external store. useSyncExternalStore keeps the
 *     server and first client render in lockstep via `getServerSnapshot`
 *     (which assumes "not seen"), so there's no hydration mismatch; React then
 *     reads the real client snapshot and re-renders if this session already
 *     saw the intro. It also keeps react-hooks/set-state-in-effect happy.
 *   - Setting the flag on completion happens in the `onComplete` event
 *     handler, where updating state is expected.
 */
const SEEN_KEY = "buycart-intro-seen";

function subscribe(onStoreChange) {
  // sessionStorage doesn't notify the same tab, so this mainly covers other
  // tabs (the cross-tab `storage` event). The same-tab "completed" case is
  // handled by local state in `handleComplete`.
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getSeenSnapshot() {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) !== null;
  } catch {
    // Storage unavailable (e.g. private mode) - act as if not seen.
    return false;
  }
}

function getSeenServerSnapshot() {
  // The server can't read sessionStorage; assume the intro hasn't been seen.
  return false;
}

export default function SplashGate({ children }) {
  const seen = useSyncExternalStore(subscribe, getSeenSnapshot, getSeenServerSnapshot);
  const [finished, setFinished] = useState(false);
  const showing = !seen && !finished;

  const handleComplete = () => {
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Ignore; the intro will simply play again next time.
    }
    setFinished(true);
  };

  return (
    <>
      {children}
      {showing ? <SplashScreen onComplete={handleComplete} /> : null}
    </>
  );
}
