"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../lib/auth";

/* Client-side gate for the /admin area.
 *
 * The real protection is on the API (authenticate + adminOnly in
 * apps/backend/src/middleware), so this is UX only: it stops a signed-out or
 * regular visitor from staring at a page full of failed requests, and sends
 * them to /login instead. The `next` param brings them back here afterwards. */
export default function AdminGate({ children }) {
  const router = useRouter();
  const { user, status } = useUser();

  useEffect(() => {
    if (status !== "ready") return;

    if (!user) {
      router.replace("/login?next=/admin");
    } else if (user.role !== "admin") {
      router.replace("/");
    }
  }, [status, user, router]);

  const allowed = status === "ready" && user?.role === "admin";

  if (!allowed) {
    return (
      <div className="admin-gate" role="status" aria-live="polite">
        <span>{status === "ready" ? null : "Checking your access…"}</span>
        {/* Mount the admin UI hidden rather than dropping it: Next's
         * instant-navigation validation (dev-only) flags routes whose page
         * segment never renders, and the API enforces access anyway. */}
        <div hidden>{children}</div>
      </div>
    );
  }

  return children;
}
