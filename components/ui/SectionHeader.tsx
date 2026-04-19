interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
}

export function SectionHeader({ label, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-12">
      <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-3">
        {label}
      </p>
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-[var(--muted)] text-lg max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
