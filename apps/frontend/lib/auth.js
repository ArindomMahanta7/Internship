"use client";

import { useEffect, useSyncExternalStore } from "react";
import { fetchMe, login as apiLogin, logout as apiLogout } from "./api";

/* Session store for the current user.
 *
 * The auth token is an HTTP-only cookie, so the browser can't read it - the
 * only way to know who is signed in is GET /api/auth/me. That is fetched once
 * per page load and shared through a tiny module-level store (the same
 * useSyncExternalStore pattern lib/cart.js uses), so the navbar, cart and
 * orders pages all agree on the session without duplicating requests.
 *
 *   const { user, status, refresh } = useUser();   // status: loading|ready|error
 */

let state = { user: null, status: "loading" };
let promise = null;
const listeners = new Set();

function emit() {
  for (const listener of listeners) listener();
}

function setState(next) {
  state = { ...state, ...next };
  emit();
}

/* Loads /me once; concurrent callers share the same in-flight promise. */
function load() {
  if (promise) return promise;

  promise = fetchMe()
    .then((user) => setState({ user, status: "ready" }))
    // A network failure must not look like "logged out" - keep the last user.
    .catch(() => setState({ status: "error" }))
    .finally(() => {
      promise = null;
    });

  return promise;
}

function subscribe(listener) {
  listeners.add(listener);
  // First subscriber kicks off the (single) request.
  if (listeners.size === 1) load();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return state;
}

export function useUser() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (snapshot.status === "loading") load();
  }, [snapshot.status]);

  return {
    user: snapshot.user,
    status: snapshot.status,
    isLoggedIn: Boolean(snapshot.user),
    refresh: load,
  };
}

/* Wraps the API login so the store updates immediately instead of waiting for
 * the next page load - the navbar flips to "signed in" right away. */
export async function signIn(identifier, password) {
  const user = await apiLogin(identifier, password);
  setState({ user: user ?? null, status: "ready" });
  return user;
}

export async function signOut() {
  try {
    await apiLogout();
  } finally {
    // Even if the call failed, drop the local session.
    setState({ user: null, status: "ready" });
  }
}
