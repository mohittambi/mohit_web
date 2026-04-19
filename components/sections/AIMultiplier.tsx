"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Zap,
  Bug,
  BarChart3,
  Gauge,
  Layers,
  Package,
  Braces,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const useCases = [
  {
    icon: Cpu,
    title: "System Design Exploration",
    body: "Use LLMs to rapidly sketch alternative architectures, stress-test assumptions, and surface edge cases before a single line of code is written. Faster iteration on design, not replacement of judgment.",
  },
  {
    icon: Zap,
    title: "Code Acceleration",
    body: "AI handles the boilerplate — test scaffolding, migration scripts, schema generation. Engineers stay in the high-leverage work: design, review, and the decisions that require context.",
  },
  {
    icon: Bug,
    title: "Debugging Complex Issues",
    body: "Distributed system bugs span multiple services and logs. AI-assisted correlation of traces, structured logs, and error patterns reduces mean time to diagnose by removing manual grep hunting.",
  },
  {
    icon: BarChart3,
    title: "Developer Productivity",
    body: "Code review assistance, documentation generation, PR description drafts. The compounding effect: every engineer on the team moves faster when cognitive overhead on solved problems is offloaded.",
  },
  {
    icon: Gauge,
    title: "API Usage & Platform Cost",
    body: "Treat LLM calls like any other dependency: budgets per feature, model routing by latency vs quality, structured logging of tokens and errors, and dashboards that tie spend to business outcomes — not surprise invoices.",
  },
  {
    icon: Layers,
    title: "Caching, Context & Retention",
    body: "Summarisation, sliding windows, and retrieval keep prompts within limits without losing intent. Session state belongs in your systems — not stuffed into every request — with clear TTLs and invalidation when facts change.",
  },
  {
    icon: Package,
    title: "Batch Processing & Pipelines",
    body: "Batch APIs and async jobs for embeddings, evaluations, and backfills beat hammering synchronous endpoints. Queue depth, idempotency, and partial replay patterns from distributed systems apply directly to AI workloads.",
  },
  {
    icon: Braces,
    title: "Prompt Engineering & Evals",
    body: "Structured outputs (JSON schemas, tool contracts), few-shot examples that mirror production inputs, and regression suites over golden prompts catch regressions before users do — the same rigor as API contract tests.",
  },
];

export function AIMultiplier() {
  return (
    <section id="ai" className="py-24 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            label="AI Engineering"
            title="AI as an engineering multiplier."
            description="Not a buzzword. A set of practical patterns that make engineers — and entire teams — move faster without cutting corners."
          />
        </motion.div>

        {/* Callout quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border-l-2 border-[var(--accent)] pl-5 mb-12 text-[var(--muted)] text-lg leading-relaxed italic max-w-3xl"
        >
          "AI removes cognitive overhead on solved problems, freeing engineers for the
          unsolved ones."
        </motion.blockquote>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {useCases.map((uc, i) => (
            <motion.article
              key={uc.title}
              tabIndex={0}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={[
                "group relative flex min-h-[9.5rem] flex-col rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-6",
                "transition-[border-color,box-shadow,transform] duration-300 ease-out",
                "hover:-translate-y-0.5 hover:border-[var(--accent)]/35 hover:shadow-lg hover:shadow-[var(--accent)]/8",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
                "motion-reduce:hover:translate-y-0 motion-reduce:transition-colors",
              ].join(" ")}
            >
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent)]/0 opacity-0 transition-opacity duration-300 group-hover:from-[var(--accent)]/[0.04] group-hover:to-transparent group-hover:opacity-100 group-focus-within:from-[var(--accent)]/[0.04] group-focus-within:to-transparent group-focus-within:opacity-100 motion-reduce:opacity-0" aria-hidden />

              <div className="relative flex flex-1 flex-col">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)]/10 transition-colors duration-300 group-hover:bg-[var(--accent)]/15">
                    <uc.icon size={18} className="text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-snug text-[var(--text)]">{uc.title}</h3>
                    <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] opacity-80 transition-opacity duration-200 group-hover:opacity-0 group-focus-within:opacity-0 [@media(hover:none)]:sr-only motion-reduce:sr-only">
                      Hover or focus to expand
                    </p>
                  </div>
                </div>

                <div
                  className={[
                    "grid flex-1 grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                    "group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]",
                    "[@media(hover:none)]:grid-rows-[1fr]",
                    "motion-reduce:grid-rows-[1fr]",
                  ].join(" ")}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p className="mt-4 border-t border-[var(--border-color)]/70 pt-4 text-sm leading-relaxed text-[var(--muted)] opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 [@media(hover:none)]:opacity-100 [@media(hover:none)]:translate-y-0 motion-reduce:opacity-100 motion-reduce:translate-y-0 translate-y-1">
                      {uc.body}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* AI tools strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 pt-8 border-t border-[var(--border-color)] flex flex-wrap items-center gap-3"
        >
          <span className="text-xs text-[var(--muted)] font-medium mr-2">Tools in active use:</span>
          {[
            "GitHub Copilot",
            "Claude (Anthropic)",
            "Google Gemini",
            "ChatGPT",
            "Cursor",
            "LLM-assisted code review",
          ].map(
            (tool) => (
              <span
                key={tool}
                className="text-xs px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--surface)] text-[var(--muted)]"
              >
                {tool}
              </span>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}
