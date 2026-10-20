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

  if (status !== "ready") {
    return (
      <div className="admin-gate" role="status" aria-live="polite">
        Checking your access…
      </div>
    );
  }

  // Signed in but not an admin: the redirect above is already in flight.
  if (!user || user.role !== "admin") {
    return <div className="admin-gate" role="status" aria-live="polite" />;
  }

  return children;
}
