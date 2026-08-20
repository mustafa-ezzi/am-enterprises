/**
 * Motion policy for AM Enterprises
 * See development.md §5 — React Bits–inspired, editorial restraint.
 */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Run animation setup only when motion is allowed. */
export function withMotion(run: () => void | (() => void)): void | (() => void) {
  if (prefersReducedMotion()) return;
  return run();
}
