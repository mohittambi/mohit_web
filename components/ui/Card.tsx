interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--border-color)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] ${
        hover
          ? "transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
