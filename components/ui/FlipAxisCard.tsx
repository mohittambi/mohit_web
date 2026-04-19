"use client";

import { useReducedMotion } from "framer-motion";
import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

export type FlipAxisCardProps = Readonly<{
  /** Used for `aria-label` on the tile and the reveal control. */
  tileLabel: string;
  front: ReactNode;
  back: ReactNode;
  /** Fixed size keeps grid rows aligned; back scrolls if needed. */
  tileClassName?: string;
}>;

export function FlipAxisCard({ tileLabel, front, back, tileClassName = "h-[17rem] w-full" }: FlipAxisCardProps) {
  const reduceMotion = useReducedMotion() === true;
  const [pinnedOpen, setPinnedOpen] = useState(false);

  if (reduceMotion) {
    return (
      <article
        className={`flex flex-col rounded-xl border border-[var(--border-color)] bg-[var(--bg)] ${tileClassName}`}
        aria-label={tileLabel}
      >
        <div className="relative flex shrink-0 flex-col items-center justify-center px-6 py-8 text-center">
          <div
            className="pointer-events-none absolute inset-0 rounded-t-xl opacity-50 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,var(--accent-glow),transparent_72%)]"
            aria-hidden
          />
          <div className="relative w-full">{front}</div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto border-t border-[var(--border-color)]/70 px-6 py-4">{back}</div>
      </article>
    );
  }

  return (
    <article
      className={`group relative rounded-xl [perspective:1100px] ${tileClassName}`}
      aria-label={`${tileLabel}. Hover, focus, or tap to flip for details.`}
    >
      <div className="relative h-full min-h-0 w-full">
        <div
          className="absolute inset-0 [transform-style:preserve-3d] transition-[transform] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]"
          style={{ transform: pinnedOpen ? "rotateY(180deg)" : undefined }}
        >
          <button
            type="button"
            className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg)] px-5 py-6 text-center [backface-visibility:hidden] [transform:rotateY(0deg)] [transform-style:preserve-3d] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
            style={{ WebkitBackfaceVisibility: "hidden" }}
            aria-label={`Show details: ${tileLabel}`}
            onClick={() => setPinnedOpen(true)}
          >
            <span
              className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.45] bg-[radial-gradient(ellipse_90%_65%_at_50%_12%,var(--accent-glow),transparent_70%)]"
              aria-hidden
            />
            <span className="relative flex w-full max-w-[16rem] flex-col items-center justify-center gap-4">{front}</span>
          </button>

          <div
            className="absolute inset-0 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg)] [backface-visibility:hidden] [transform:rotateY(180deg)] [transform-style:preserve-3d]"
            style={{ WebkitBackfaceVisibility: "hidden" }}
          >
            {/* × only when tap-pinned: hover flips away when the pointer leaves, so no dismiss control needed */}
            {pinnedOpen ? (
              <button
                type="button"
                className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--text)]"
                aria-label={`Close details: ${tileLabel}`}
                onClick={() => setPinnedOpen(false)}
              >
                <X size={16} strokeWidth={2} aria-hidden />
              </button>
            ) : null}
            <div
              className={`h-full overflow-y-auto overflow-x-hidden px-6 pb-6 ${pinnedOpen ? "pt-12" : "pt-6"}`}
            >
              {back}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
