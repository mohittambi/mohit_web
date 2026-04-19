import type { BlogDifficulty } from "@/data/blog/types";

const chipClass: Record<BlogDifficulty, string> = {
  Foundational:
    "border border-emerald-600/25 bg-emerald-600/10 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100",
  Intermediate:
    "border border-[var(--accent)]/30 bg-[var(--accent-muted)] text-[var(--accent)]",
  "Deep dive":
    "border border-[var(--accent)]/45 bg-[var(--accent)]/15 text-[var(--accent)] font-semibold",
};

export function DifficultyChip({ level }: Readonly<{ level: BlogDifficulty }>) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${chipClass[level]}`}
    >
      {level}
    </span>
  );
}
