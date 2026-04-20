"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";

/** Client-side Mermaid render (SSR shows placeholder until SVG mounts). */
export function MermaidBlock({ code }: Readonly<{ code: string }>) {
  const reactId = useId().replace(/:/g, "");
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = resolvedTheme === "dark";
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: isDark ? "dark" : "neutral",
        });
        const uid = `${reactId}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: out } = await mermaid.render(uid, code.trim());
        if (!cancelled) {
          setSvg(out);
          setErr(null);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Diagram error");
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [code, reactId, resolvedTheme]);

  return (
    <figure
      className="my-6 overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-5 [&_svg]:mx-auto [&_svg]:max-w-none"
      aria-label="Architecture diagram"
    >
      {err ? (
        <p className="text-sm text-[var(--danger)] font-mono px-2">{err}</p>
      ) : null}
      {!svg && !err ? (
        <p className="text-[11px] font-mono text-[var(--muted)] px-2">Rendering diagram…</p>
      ) : null}
      {svg ? (
        <div className="[&_svg]:block" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : null}
    </figure>
  );
}
