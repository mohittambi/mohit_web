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
import { FlipAxisCard } from "@/components/ui/FlipAxisCard";

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
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="min-h-0 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
            >
              <FlipAxisCard
                tileLabel={uc.title}
                front={
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/12 ring-1 ring-[var(--accent)]/20">
                      <uc.icon size={20} className="text-[var(--accent)]" aria-hidden />
                    </span>
                    <h3 className="text-balance font-semibold leading-snug text-[var(--text)]">{uc.title}</h3>
                  </>
                }
                back={<p className="text-sm leading-relaxed text-[var(--muted)]">{uc.body}</p>}
              />
            </motion.div>
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
