import { useEffect } from "react";

/**
 * Register the service worker that next-pwa builds into public/sw.js, which
 * is what makes the site work offline and installable.
 *
 * Production builds only: `next dev` serves a network-only worker, and a
 * registered one outlives the dev server.
 */
export function useServiceWorker(): void {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is an extra; the site works the same without it.
    });
  }, []);
}
