import type { BlogDifficulty } from "@/data/blog/types";

const chipClass: Record<BlogDifficulty, string> = {
  Foundational:
    "border border-[var(--border-color)] bg-[var(--surface)] text-[var(--muted)]",
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
