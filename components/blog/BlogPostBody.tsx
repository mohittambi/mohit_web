import Link from "next/link";
import type { BlogSection } from "@/data/blogPosts";
import { renderBoldSegments, renderDistributionLine } from "@/components/blog/inlineEmphasis";

const warLabels = [
  { key: "context" as const, label: "Context" },
  { key: "broke" as const, label: "What broke" },
  { key: "wrong_first" as const, label: "What we tried first (wrong)" },
  { key: "solution" as const, label: "Final solution" },
  { key: "tradeoff" as const, label: "Trade-off we accepted" },
];

export function BlogPostBody({ sections }: Readonly<{ sections: BlogSection[] }>) {
  return (
    <div className="blog-prose space-y-6">
      {sections.map((block, i) => {
        if (block.kind === "h2") {
          return (
            <h2 key={i} className="text-xl font-semibold text-[var(--text)] tracking-tight pt-2">
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
            <ul
              key={i}
              className="list-disc pl-5 space-y-2 text-[var(--muted)] leading-relaxed text-[15px] sm:text-base marker:text-[var(--accent)]"
            >
              {block.items.map((item) => (
                <li key={item}>{renderBoldSegments(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === "war_story") {
          return (
            <aside
              key={i}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6 space-y-4"
            >
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
              <h2 className="text-lg font-semibold text-[var(--text)] mb-1">
                {renderBoldSegments(block.label ?? "Orders of magnitude")}
              </h2>
              <p className="text-xs text-[var(--muted)] mb-4">
                Approximate or composite ranges—replace with measurements from your own systems when publishing.
              </p>
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
            <nav
              key={i}
              aria-label="Related posts"
              className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] p-5 sm:p-6"
            >
              <p className="text-sm font-medium text-[var(--text)] mb-4">{renderBoldSegments(block.intro)}</p>
              <ol className="space-y-3 list-decimal list-inside marker:text-[var(--accent)] marker:font-semibold">
                {block.items.map((item) => (
                  <li key={item.slug} className="text-sm text-[var(--muted)] leading-relaxed pl-1">
                    <Link
                      href={`/blog/${item.slug}`}
                      className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] underline-offset-2 hover:underline"
                    >
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
              <h2 className="text-lg font-semibold text-[var(--text)] mb-1">Architecture diagram (spec)</h2>
              <p className="text-xs text-[var(--muted)] mb-4">
                Draw with failure arrows, retries, and bottlenecks—not generic boxes. Keep one **sketch style** across
                posts (e.g. Excalidraw for architecture “stories”, Mermaid for sequences and state machines), one accent
                palette, and one alarm colour for failure paths—so figures read as one body of work when you export them
                for the post.
              </p>
              <p className="text-sm font-medium text-[var(--text)] mb-2">{renderBoldSegments(block.title)}</p>
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
              <h2 className="text-lg font-semibold text-[var(--text)] mb-1">If I were building this from scratch</h2>
              <p className="text-xs text-[var(--muted)] mb-5">Roadmap signal for staff+ scope—not tutorial steps.</p>
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">Week 1</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--muted)] leading-relaxed">
                    {block.week1.map((line) => (
                      <li key={line}>{renderBoldSegments(line)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">Month 1</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--muted)] leading-relaxed">
                    {block.month1.map((line) => (
                      <li key={line}>{renderBoldSegments(line)}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">Scale phase</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-[var(--muted)] leading-relaxed">
                    {block.scale.map((line) => (
                      <li key={line}>{renderBoldSegments(line)}</li>
                    ))}
                  </ul>
                </div>
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
            <section
              key={i}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6"
              aria-label="Further reading"
            >
              <h2 className="text-lg font-semibold text-[var(--text)] mb-1">Further reading</h2>
              <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed max-w-prose">{renderBoldSegments(block.intro)}</p>
              <ul className="space-y-5 list-none p-0 m-0">
                {block.items.map((item) => (
                  <li key={item.href} className="pl-4 border-l-2 border-[var(--accent)]/35">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-hover)] underline-offset-2 hover:underline"
                    >
                      {item.title}
                    </a>
                    <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">{renderBoldSegments(item.context)}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        }
        if (block.kind === "signal_pack") {
          return (
            <section key={i} className="rounded-xl border-2 border-[var(--accent)]/40 bg-[var(--accent)]/[0.04] p-5 sm:p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[var(--text)]">Signal pack (distribution)</h2>
              <p className="text-xs text-[var(--muted)]">
                Hook and diagram notes for social posts; references below are real hyperlinks (not raw URLs). Use the
                bullets as an outline—tighten in your voice before you post.
              </p>
              <div>
                <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">Opinion hook (lead post)</h3>
                <p className="text-sm text-[var(--text)] font-medium leading-snug border-l-2 border-[var(--accent)] pl-3">
                  {renderBoldSegments(block.hook)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">One strong visual</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{renderBoldSegments(block.visual)}</p>
              </div>
              {block.linkedInThread.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[var(--accent)] mb-2">References & links</h3>
                  <p className="text-xs text-[var(--muted)] mb-3 leading-relaxed">
                    Official docs and this site—links open in a new tab. Lines without links are plain copy for your
                    outline.
                  </p>
                  <ol className="space-y-3 list-decimal list-outside text-sm text-[var(--muted)] leading-relaxed marker:font-semibold marker:text-[var(--accent)] ml-5 pl-1">
                    {block.linkedInThread.map((tweet, ti) => (
                      <li key={`${ti}-${tweet.slice(0, 32)}`} className="pl-1">
                        {renderDistributionLine(tweet)}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </section>
          );
        }
        return null;
      })}
    </div>
  );
}
