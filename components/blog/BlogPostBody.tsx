import Link from "next/link";
import katex from "katex";
import type { BlogSection } from "@/data/blogPosts";
import { renderBoldSegments } from "@/components/blog/inlineEmphasis";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { MermaidBlock } from "@/components/blog/MermaidBlock";
import { ArchitectureToggle } from "@/components/blog/ArchitectureToggle";
import { codeToHtml } from "shiki";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

function renderFormula(formula: string): React.ReactNode {
  const lines = formula.trim().split("\n");
  return (
    <div className="mt-3 space-y-1.5">
      {lines.map((line) => {
        if (!line.trim()) return null;
        const isLatex = line.startsWith("$");
        if (isLatex) {
          const latex = line.replace(/^\$\$?/, "").replace(/\$\$?$/, "");
          try {
            const html = katex.renderToString(latex, { displayMode: true, throwOnError: false });
            return (
              <div
                key={line}
                className="overflow-x-auto py-1 text-[var(--accent)]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            /* fall through */
          }
        }
        return (
          <code key={line} className="block font-mono text-[13px] text-[var(--accent)] bg-[var(--bg)] border border-[var(--border-color)] rounded px-3 py-1.5 overflow-x-auto whitespace-pre">
            {line}
          </code>
        );
      })}
    </div>
  );
}

const warLabels = [
  { key: "context" as const, label: "Context" },
  { key: "broke" as const, label: "What broke" },
  { key: "wrong_first" as const, label: "What we tried first (wrong)" },
  { key: "solution" as const, label: "Final solution" },
  { key: "tradeoff" as const, label: "Trade-off we accepted" },
];

async function renderSection(block: BlogSection, i: number): Promise<React.ReactNode> {
  if (block.kind === "code_block") {
    return <CodeBlock key={i} code={block.code} language={block.language} title={block.title} />;
  }
  if (block.kind === "mermaid") {
    return <MermaidBlock key={i} code={block.code} />;
  }
  if (block.kind === "system_alert") {
    return (
      <aside
        key={i}
        className="rounded-[2px] border border-[var(--border-color)] border-l-[3px] border-l-[var(--accent)] bg-[var(--surface)] px-4 py-4 my-2"
        role="note"
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)] mb-2 font-mono">
          {block.label}
        </p>
        <div className="text-sm text-[var(--muted)] leading-relaxed">{renderBoldSegments(block.text)}</div>
      </aside>
    );
  }
  if (block.kind === "ol") {
    return (
      <ol
        key={i}
        className="list-decimal pl-6 space-y-2 text-[var(--muted)] leading-relaxed text-[15px] sm:text-base marker:font-mono marker:text-[var(--accent)]"
      >
        {block.items.map((item) => (
          <li key={item}>{renderBoldSegments(item)}</li>
        ))}
      </ol>
    );
  }
  if (block.kind === "hr") {
    return <hr key={i} className="border-0 border-t border-[var(--border-color)] my-10" />;
  }
  if (block.kind === "architecture_toggle") {
    return <ArchitectureToggle key={i} variant={block.variant ?? "lambda_ecs"} />;
  }
  if (block.kind === "prompt_example") {
    async function highlightPane(code: string, language = "text") {
      try {
        return await codeToHtml(code.trim(), {
          lang: language,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        });
      } catch {
        return null;
      }
    }
    const [beforeHtml, afterHtml] = await Promise.all([
      block.before ? highlightPane(block.before.code, block.before.language) : Promise.resolve(null),
      highlightPane(block.after.code, block.after.language),
    ]);

    function PaneCode({ html, code }: { html: string | null; code: string }) {
      if (html) {
        return (
          <div
            className="shiki-block text-[12.5px] leading-relaxed overflow-x-auto [&>pre]:p-4 [&>pre]:m-0 [&>pre]:overflow-x-auto [&>pre]:whitespace-pre-wrap [&>pre]:break-words"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }
      return (
        <pre className="p-4 text-[12.5px] font-mono leading-relaxed text-[var(--muted)] bg-[var(--surface)] overflow-x-auto whitespace-pre-wrap break-words m-0">
          {code}
        </pre>
      );
    }

    return (
      <div key={i} className="space-y-2">
        {block.title && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">{block.title}</p>
        )}
        <div className={`grid gap-3 ${block.before ? "sm:grid-cols-2" : ""}`}>
          {block.before && (
            <div className="rounded-xl border border-red-500/30 overflow-hidden">
              <div className="px-3 py-2 bg-red-500/[0.08] border-b border-red-500/20 flex items-center gap-2">
                <span className="text-red-400 text-base leading-none" aria-hidden>✗</span>
                <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wide">{block.before.label ?? "Before"}</span>
              </div>
              <PaneCode html={beforeHtml} code={block.before.code} />
            </div>
          )}
          <div className="rounded-xl border overflow-hidden border-[var(--accent)]/30">
            <div className="px-3 py-2 border-b flex items-center gap-2 bg-[var(--accent)]/[0.08] border-[var(--accent)]/20">
              <span className="text-base leading-none text-[var(--accent)]" aria-hidden>
                {block.before ? "✓" : "→"}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                {block.after.label ?? (block.before ? "After" : "Example")}
              </span>
            </div>
            <PaneCode html={afterHtml} code={block.after.code} />
          </div>
        </div>
        {block.note && (
          <p className="text-[12px] text-[var(--muted)]/80 leading-relaxed pt-1">{renderBoldSegments(block.note)}</p>
        )}
      </div>
    );
  }
  if (block.kind === "h2") {
    const id = slugify(block.text);
    return (
      <h2 key={i} id={id} className="text-2xl font-bold text-[var(--text)] tracking-tight pt-4 scroll-mt-24 border-l-2 border-[var(--accent)]/40 pl-4">
        {renderBoldSegments(block.text)}
      </h2>
    );
  }
  if (block.kind === "p") {
    return (
      <p key={i} className="text-[var(--muted)] leading-relaxed text-[15px] sm:text-base">
        {renderBoldSegments(block.text)}
      </p>
    );
  }
  if (block.kind === "ul") {
    return (
      <ul key={i} className="list-disc pl-5 space-y-2 text-[var(--muted)] leading-relaxed text-[15px] sm:text-base marker:text-[var(--accent)]">
        {block.items.map((item) => (
          <li key={item}>{renderBoldSegments(item)}</li>
        ))}
      </ul>
    );
  }
  if (block.kind === "war_story") {
    return (
      <aside key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Real scenario</p>
        {warLabels.map(({ key, label }) => (
          <div key={key}>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-1.5">{label}</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">{renderBoldSegments(block[key])}</p>
          </div>
        ))}
      </aside>
    );
  }
  if (block.kind === "what_not") {
    return (
      <section key={i} className="rounded-xl border border-red-500/25 bg-red-500/[0.06] dark:bg-red-500/[0.08] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-3">What I would NOT do</h2>
        <ul className="space-y-3">
          {block.paragraphs.map((para) => (
            <li key={para} className="text-sm text-[var(--muted)] leading-relaxed pl-3 border-l-2 border-red-500/50">
              {renderBoldSegments(para)}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (block.kind === "numbers_note") {
    return (
      <section key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">
          {renderBoldSegments(block.label ?? "Orders of magnitude")}
        </h2>
        <ul className="space-y-2.5">
          {block.paragraphs.map((para) => (
            <li key={para} className="text-sm text-[var(--muted)] leading-relaxed pl-3 border-l-2 border-[var(--accent)]/50">
              {renderBoldSegments(para)}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (block.kind === "read_next") {
    return (
      <nav key={i} aria-label="Related posts" className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] p-5 sm:p-6">
        <p className="text-sm font-medium text-[var(--text)] mb-4">{renderBoldSegments(block.intro)}</p>
        <ol className="space-y-3 list-decimal list-inside marker:text-[var(--accent)] marker:font-semibold">
          {block.items.map((item) => (
            <li key={item.slug} className="text-sm text-[var(--muted)] leading-relaxed pl-1">
              <Link href={`/blog/${item.slug}`} className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] underline-offset-2 hover:underline">
                {item.title}
              </Link>
              <span className="text-[var(--muted)]"> — {renderBoldSegments(item.why)}</span>
            </li>
          ))}
        </ol>
      </nav>
    );
  }
  if (block.kind === "diagram_brief") {
    return (
      <section key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">Architecture overview</p>
        <p className="text-sm font-semibold text-[var(--text)] mb-3">{renderBoldSegments(block.title)}</p>
        <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--muted)] leading-relaxed marker:text-[var(--accent)]">
          {block.elements.map((el) => (
            <li key={el}>{renderBoldSegments(el)}</li>
          ))}
        </ul>
      </section>
    );
  }
  if (block.kind === "cto_from_scratch") {
    return (
      <section key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-5">If I were building this from scratch</h2>
        <div className="space-y-5">
          {[{ label: "Week 1", items: block.week1 }, { label: "Month 1", items: block.month1 }, { label: "Scale phase", items: block.scale }].map(({ label, items }) => (
            <div key={label}>
              <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">{label}</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--muted)] leading-relaxed">
                {items.map((line) => <li key={line}>{renderBoldSegments(line)}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (block.kind === "interview_prep") {
    return (
      <section key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6 space-y-5">
        <h2 className="text-lg font-semibold text-[var(--text)]">Interview-ready summaries</h2>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] mb-2">How I explain this in interviews (~30 sec)</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{renderBoldSegments(block.interview30)}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] mb-2">How I explain this to a CTO (~1 min)</h3>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{renderBoldSegments(block.cto1min)}</p>
        </div>
      </section>
    );
  }
  if (block.kind === "further_reading") {
    return (
      <section key={i} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6" aria-label="Further reading">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-1">Further reading</h2>
        <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed max-w-prose">{renderBoldSegments(block.intro)}</p>
        <ul className="space-y-5 list-none p-0 m-0">
          {block.items.map((item) => (
            <li key={item.href} className="pl-4 border-l-2 border-[var(--accent)]/35">
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] underline-offset-2 hover:underline">
                {item.title}
              </a>
              <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">{renderBoldSegments(item.context)}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (block.kind === "signal_pack") return null;
  if (block.kind === "cost_note") {
    return (
      <section key={i} className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/[0.06] dark:bg-[var(--accent)]/[0.08] p-5 sm:p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5">
          <span aria-hidden>$</span>
          {block.label ?? "FinOps note"}
        </p>
        <ul className="space-y-2.5">
          {block.paragraphs.map((para) => (
            <li key={para} className="text-sm text-[var(--muted)] leading-relaxed pl-3 border-l-2 border-[var(--accent)]/40">
              {renderBoldSegments(para)}
            </li>
          ))}
        </ul>
        {block.formula && renderFormula(block.formula)}
      </section>
    );
  }
  if (block.kind === "region_note") {
    return (
      <section key={i} className="rounded-xl border border-[var(--accent)]/25 bg-[var(--surface)] p-5 sm:p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5">
          <span aria-hidden>⊕</span>
          Regional note · {block.region ?? "ap-south-1 (Mumbai)"}
        </p>
        <ul className="space-y-2.5">
          {block.paragraphs.map((para) => (
            <li key={para} className="text-sm text-[var(--muted)] leading-relaxed pl-3 border-l-2 border-[var(--accent)]/35">
              {renderBoldSegments(para)}
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (block.kind === "cost_table") {
    return (
      <section key={block.title} className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">{block.title}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-[var(--accent)]/10 text-left">
                {block.headers.map((h) => (
                  <th key={h} className="px-3 py-2.5 text-xs font-semibold text-[var(--accent)] uppercase tracking-wide border-b border-[var(--border-color)] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="even:bg-[var(--surface)] odd:bg-[var(--bg)]">
                  {row.map((cell, ci) => (
                    <td key={block.headers[ci] ?? cell} className={`px-3 py-2.5 text-[var(--muted)] border-b border-[var(--border-color)]/50 ${ci === 0 ? "font-medium text-[var(--text)]" : "font-mono text-xs"}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {block.note && <p className="mt-3 text-xs text-[var(--muted)]/70 leading-relaxed">{block.note}</p>}
      </section>
    );
  }
  return null;
}

export async function BlogPostBody({ sections }: Readonly<{ sections: BlogSection[] }>) {
  const nodes = await Promise.all(sections.map(renderSection));
  return <div className="blog-prose space-y-6">{nodes}</div>;
}
