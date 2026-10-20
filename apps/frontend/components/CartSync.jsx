"use client";

import { useEffect, useRef } from "react";
import { useCart, setCart } from "../lib/cart";
import { useUser } from "../lib/auth";
import { pullCart, pushCart } from "../lib/api";

/* Keeps the browser cart and the account's server cart in step.
 *
 * The cart lives in localStorage (fast, works signed-out) and the account
 * keeps its own copy on the server so orders can be placed against it. This
 * component reconciles the two once per sign-in:
 *
 *   - signed out            -> nothing to do
 *   - signed in, empty bag  -> adopt whatever the account had stored
 *   - signed in, has items  -> push the local bag up (it wins, since that is
 *                              what the visitor is actively shopping)
 *
 * Rendering it once in the shop layout is enough - it holds no UI.
 * Everything is best-effort: a failed sync must never break the page, so
 * errors are swallowed (checkout still pushes the cart again before ordering).
 */
export default function CartSync() {
  const { items } = useCart();
  const { isLoggedIn, status } = useUser();
  const syncedFor = useRef(null);

  useEffect(() => {
    if (status !== "ready") return;
    if (!isLoggedIn) {
      syncedFor.current = null;
      return;
    }

    // `items` is only a dep so a bag emptied mid-flight doesn't re-push.
    const run = async () => {
      try {
        if (items.length === 0) {
          const serverItems = await pullCart();
          // Only adopt when the local bag is genuinely empty.
          if (serverItems.length > 0) setCart(serverItems);
          return;
        }
        await pushCart(items);
      } catch {
        // Best-effort - checkout pushes the cart again anyway.
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isLoggedIn]);

  return null;
}
