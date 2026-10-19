"use client";

import { useSyncExternalStore } from "react";

/*
 * Copyright year for the footer.
 *
 * Reading the clock during render is an unstable prerender value under
 * Cache Components (blocking-prerender-current-time), and the year must not
 * block the static shell - it changes once a year and this line sits at the
 * very bottom of the page.
 *
 * useSyncExternalStore is the React-sanctioned way to read browser-only
 * values: the server/prerender snapshot is empty, the browser snapshot is
 * the current year, and React re-renders after hydration with no mismatch
 * warning. The subscribe is a no-op because the year never changes while a
 * page is open.
 */

const subscribe = () => () => {};
const getYearOnClient = () => String(new Date().getFullYear());
const getYearOnServer = () => "";

export default function CopyrightYear() {
  const year = useSyncExternalStore(subscribe, getYearOnClient, getYearOnServer);

  return (
    <span>
      © {year} BuyCart. All rights reserved.
    </span>
  );
}
