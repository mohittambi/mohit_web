interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "subtle";
}

export function Badge({ children, variant = "default" }: BadgeProps) {
  const styles = {
    default:
      "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border-color)]",
    accent:
      "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20",
    subtle:
      "bg-transparent text-[var(--muted)] border border-[var(--border-color)]",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
