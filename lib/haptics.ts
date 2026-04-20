/** Short pulse for meaningful toggles (Android Chrome); no-op elsewhere. Respects reduced motion. */
export function hapticCommit(): void {
  if (typeof globalThis === "undefined" || typeof window === "undefined") return;
  try {
    if (globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      navigator.vibrate(15);
    }
  } catch {
    /* ignore */
  }
}
