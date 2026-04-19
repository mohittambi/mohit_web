type BadgeProps = Readonly<{
  children: React.ReactNode;
  variant?: "default" | "accent" | "subtle";
}>;

export function Badge({ children, variant = "default" }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full text-[11px] sm:text-xs font-medium leading-tight px-2.5 py-1 transition-[color,background-color,border-color,box-shadow] duration-150";

  const styles = {
    default:
      "bg-[var(--surface)] text-[var(--text)]/80 border border-[var(--border-color)] shadow-sm",
    accent:
      "bg-[var(--accent)]/12 text-[var(--accent)] border border-[var(--accent)]/25 shadow-sm",
    subtle:
      "bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
  };

  return <span className={`${base} ${styles[variant]}`}>{children}</span>;
}
