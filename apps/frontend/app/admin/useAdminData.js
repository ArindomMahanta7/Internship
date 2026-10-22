"use client";

import { useCallback, useEffect, useState } from "react";

/* Data loader shared by the /admin screens.
 *
 *   const { data, status, error, reload } = useAdminData(fetchAllOrders);
 *
 *   status: "loading" | "ready" | "error"
 *
 * The mount fetch lives in the effect and only resolves into state through
 * the promise callbacks, so there is no synchronous setState in the effect
 * body (which would cascade renders). `reload` is for the "Try again"
 * buttons - it is an event handler, so flipping back to "loading" there is
 * fine. A cancelled flag keeps a stale response from landing after unmount.
 *
 * Pass a stable fetcher (a module-level import like `fetchAllOrders`);
 * it becomes the effect's dependency. */
export default function useAdminData(fetcher) {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });

  useEffect(() => {
    let alive = true;

    fetcher()
      .then((data) => {
        if (alive) setState({ status: "ready", data, error: "" });
      })
      .catch((error) => {
        if (alive) setState({ status: "error", data: null, error: error.message });
      });

    return () => {
      alive = false;
    };
  }, [fetcher]);

  const reload = useCallback(() => {
    setState((current) => ({ ...current, status: "loading", error: "" }));

    fetcher()
      .then((data) => setState({ status: "ready", data, error: "" }))
      .catch((error) => setState({ status: "error", data: null, error: error.message }));
  }, [fetcher]);

  return { ...state, reload };
}
