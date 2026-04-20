"use client";
import { useEffect, useState } from "react";

interface TocItem { id: string; text: string }

export function BlogTOC({ headings }: Readonly<{ headings: TocItem[] }>) {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (headings.length < 2) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-10% 0px -70% 0px" }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden xl:block sticky top-28 self-start w-52 shrink-0 ml-10">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
        On this page
      </p>
      <ul className="space-y-1.5 border-l border-[var(--border-color)] pl-3">
        {headings.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block text-[12px] leading-snug transition-all duration-150 ${
                active === id
                  ? "text-[var(--accent)] font-semibold -translate-x-px border-l-2 border-[var(--accent)] -ml-[1px] pl-3"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {text.length > 42 ? text.slice(0, 42) + "…" : text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
