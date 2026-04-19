"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

/* ── Logo items ───────────────────────────────────────────────── */
interface LogoItem {
  name: string;
  file?: string;
  size: "xl" | "lg" | "md" | "sm";
  offset?: number;
}

/* ── Category definition ─────────────────────────────────────── */
interface Category {
  number: string;
  title: string;
  description: string;
  insight: string;
  logos: LogoItem[];
}

const CATEGORIES: Category[] = [
  {
    number: "01",
    title: "Backend",
    description:
      "Production-grade API and service design at scale — from high-throughput REST endpoints to persistent WebSocket connections and real-time pub/sub.",
    insight:
      "Performance is architecture. The right pattern at design time beats any runtime optimisation.",
    logos: [
      { name: "Node.js",    file: "/logos/nodejs.svg",      size: "xl", offset: 0  },
      { name: "TypeScript", file: "/logos/typescript.svg",  size: "xl", offset: 16 },
      { name: "Python",     file: "/logos/python.svg",      size: "xl", offset: 4  },
      { name: "Java",       file: "/logos/java.svg",        size: "lg", offset: 10 },
      { name: "Go",         file: "/logos/go.svg",          size: "lg", offset: 0  },
      { name: "GraphQL",    file: "/logos/graphql.svg",     size: "lg", offset: 8  },
      { name: "WebSockets",                                  size: "md", offset: 12 },
      { name: "REST APIs",                                   size: "md", offset: 0  },
      { name: "gRPC",                                        size: "sm", offset: 20 },
    ],
  },
  {
    number: "02",
    title: "Cloud & AWS",
    description:
      "Deep AWS fluency across compute, messaging, and data layers. From Lambda cold-start trade-offs to ECS cluster sizing — knowing which service to pick and why.",
    insight:
      "AWS expertise means knowing not just which service to use, but which one NOT to use.",
    logos: [
      { name: "AWS",         file: "/logos/aws.svg",         size: "xl", offset: 0  },
      { name: "ECS Fargate",                                  size: "lg", offset: 12 },
      { name: "Lambda",                                       size: "lg", offset: 4  },
      { name: "DynamoDB",                                     size: "md", offset: 18 },
      { name: "SQS / SNS",                                    size: "md", offset: 0  },
      { name: "API Gateway",                                  size: "sm", offset: 8  },
      { name: "CloudWatch",                                   size: "sm", offset: 16 },
      { name: "X-Ray",                                        size: "sm", offset: 4  },
      { name: "ElastiCache",                                  size: "sm", offset: 12 },
    ],
  },
  {
    number: "03",
    title: "Data & Storage",
    description:
      "Choosing the right storage for the right problem — from relational integrity under concurrent writes to distributed cache invalidation at microsecond precision.",
    insight:
      "Eventual consistency is a trade-off, not a default. Every data decision has a correctness cost.",
    logos: [
      { name: "PostgreSQL",    file: "/logos/postgresql.svg", size: "xl", offset: 0  },
      { name: "Redis",         file: "/logos/redis.svg",      size: "xl", offset: 14 },
      { name: "DynamoDB",                                      size: "lg", offset: 4  },
      { name: "Event Sourcing",                                size: "md", offset: 10 },
      { name: "CQRS",                                          size: "md", offset: 0  },
      { name: "NoSQL Design",                                  size: "sm", offset: 18 },
    ],
  },
  {
    number: "04",
    title: "Architecture",
    description:
      "System design decisions that hold under scale, team growth, and business change — not just load tests. Patterns chosen for failure modes, not just happy paths.",
    insight: "Good architecture is mostly about what you say no to.",
    logos: [
      { name: "Distributed Systems",    size: "xl", offset: 0  },
      { name: "Microservices",          size: "lg", offset: 14 },
      { name: "Event-Driven",           size: "lg", offset: 4  },
      { name: "Domain-Driven Design",   size: "md", offset: 10 },
      { name: "Saga Pattern",           size: "md", offset: 0  },
      { name: "Transactional Outbox",   size: "sm", offset: 18 },
      { name: "CQRS",                   size: "sm", offset: 6  },
    ],
  },
  {
    number: "05",
    title: "Observability",
    description:
      "Instrumented systems that explain their own behaviour. Correlation IDs, structured logs, and distributed traces that let you diagnose production issues without SSH.",
    insight:
      "Observability is the interface between your code and the people responsible for it at 2 AM.",
    logos: [
      { name: "OpenTelemetry", file: "/logos/opentelemetry.svg", size: "xl", offset: 0  },
      { name: "Grafana",       file: "/logos/grafana.svg",       size: "xl", offset: 16 },
      { name: "AWS X-Ray",                                        size: "lg", offset: 6  },
      { name: "CloudWatch",                                       size: "md", offset: 12 },
      { name: "Structured Logging",                               size: "md", offset: 0  },
    ],
  },
  {
    number: "06",
    title: "AI & Tooling",
    description:
      "AI as an engineering force multiplier — multi-model workflows (Claude, Gemini, ChatGPT), disciplined API usage, context and caching strategy, batch pipelines, and prompt patterns that behave like tested contracts.",
    insight:
      "The engineers who use AI well know exactly where it breaks, not just where it shines.",
    logos: [
      { name: "Claude",          file: "/logos/anthropic.svg", size: "xl", offset: 0  },
      { name: "Gemini",          file: "/logos/gemini.svg",    size: "xl", offset: 14 },
      { name: "GitHub Copilot",                                 size: "lg", offset: 4  },
      { name: "Cursor",                                         size: "md", offset: 10 },
      { name: "Prompt Engineering",                             size: "md", offset: 18 },
      { name: "LLM Workflows",                                  size: "sm", offset: 0  },
    ],
  },
  {
    number: "07",
    title: "CI/CD & DevOps",
    description:
      "Reliable, automated delivery from commit to production — with full observability and instant rollback at every stage of the pipeline.",
    insight:
      "Deployment frequency is a proxy for engineering culture. Fast deploys require fearless teams.",
    logos: [
      { name: "Docker",          file: "/logos/docker.svg",          size: "xl", offset: 0  },
      { name: "GitHub Actions",  file: "/logos/githubactions.svg",   size: "xl", offset: 16 },
      { name: "Terraform",       file: "/logos/terraform.svg",       size: "lg", offset: 4  },
      { name: "ECR",                                                  size: "md", offset: 10 },
      { name: "Blue-Green Deploys",                                   size: "sm", offset: 0  },
      { name: "Linux / RHEL",                                         size: "sm", offset: 14 },
    ],
  },
];

/* ── All logo-file items for the marquee ─────────────────────── */
interface MarqueeItem { name: string; file: string }
const MARQUEE_ITEMS: MarqueeItem[] = CATEGORIES.flatMap((c) =>
  c.logos
    .filter((l): l is LogoItem & { file: string } => l.file !== undefined)
    .map((l) => ({ name: l.name, file: l.file }))
);

/* ── Size helpers ────────────────────────────────────────────── */
const IMG_SIZE: Record<string, number> = { xl: 52, lg: 38, md: 0, sm: 0 };
const CONTAINER_SIZE: Record<string, string> = {
  xl: "w-[72px] h-[72px]",
  lg: "w-[56px] h-[56px]",
};
const TEXT_STYLE: Record<string, string> = {
  md: "px-3.5 py-1.5 text-sm",
  sm: "px-2.5 py-1 text-xs",
};

function LogoChip({ item }: Readonly<{ item: LogoItem }>) {
  if (item.file && (item.size === "xl" || item.size === "lg")) {
    return (
      <div className="flex flex-col items-center gap-1.5 group">
        <div
          className={`${CONTAINER_SIZE[item.size]} rounded-2xl border border-[var(--border-color)] bg-[var(--bg)] flex items-center justify-center shadow-sm group-hover:border-[var(--accent)]/40 group-hover:shadow-md transition-all duration-200`}
        >
          <Image
            src={item.file}
            alt={item.name}
            width={IMG_SIZE[item.size]}
            height={IMG_SIZE[item.size]}
            className="object-contain"
          />
        </div>
        <span className="text-xs text-[var(--muted)] group-hover:text-[var(--text)] transition-colors leading-none">
          {item.name}
        </span>
      </div>
    );
  }
  return (
    <div
      className={`${TEXT_STYLE[item.size]} rounded-lg border border-[var(--border-color)] bg-[var(--surface)] text-[var(--muted)] font-medium hover:border-[var(--accent)]/40 hover:text-[var(--text)] transition-all duration-200 cursor-default`}
    >
      {item.name}
    </div>
  );
}

export function TechStack() {
  const [active, setActive] = useState(0);
  const cat = CATEGORIES[active];

  return (
    <section id="stack" className="py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            label="Expertise"
            title="Depth over breadth."
            description="A deliberate set of tools for building reliable, scalable systems — chosen for failure modes, not just features."
          />
        </motion.div>
      </div>

      {/* ── Marquee ──────────────────────────────────────────── */}
      <div className="marquee-track relative mb-16 overflow-hidden">
        {/* fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[var(--bg)] to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[var(--bg)] to-transparent" />

        {/* Row 1 — left */}
        <div className="flex mb-3">
          <div className="animate-marquee-left flex gap-6 items-center pr-6 shrink-0">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <div
                key={`a-${item.name}-${i}`}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--surface)] shrink-0"
              >
                <Image src={item.file} alt={item.name} width={20} height={20} className="object-contain" />
                <span className="text-sm text-[var(--muted)] whitespace-nowrap">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — right (reversed set for variety) */}
        <div className="flex">
          <div className="animate-marquee-right flex gap-6 items-center pr-6 shrink-0">
            {[...MARQUEE_ITEMS.slice().reverse(), ...MARQUEE_ITEMS.slice().reverse()].map((item, i) => (
              <div
                key={`b-${item.name}-${i}`}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--border-color)] bg-[var(--surface)] shrink-0"
              >
                <Image src={item.file} alt={item.name} width={20} height={20} className="object-contain" />
                <span className="text-sm text-[var(--muted)] whitespace-nowrap">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category tabs ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap gap-x-8 gap-y-2 mb-10 border-b border-[var(--border-color)] pb-4">
          {CATEGORIES.map((c, i) => (
            <button
              key={c.number}
              onClick={() => setActive(i)}
              className={`group flex items-baseline gap-2 pb-4 -mb-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                active === i
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              <span
                className={`font-mono text-xs transition-colors ${
                  active === i ? "text-[var(--accent)]" : "text-[var(--muted)]/50 group-hover:text-[var(--muted)]"
                }`}
              >
                {c.number}
              </span>
              {c.title}
            </button>
          ))}
        </div>

        {/* ── Active panel ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-[2fr_3fr] gap-12 min-h-[320px]"
          >
            {/* Left: category info */}
            <div className="flex flex-col justify-center">
              <p className="font-mono text-6xl font-bold text-[var(--accent)]/10 leading-none select-none mb-4">
                {cat.number}
              </p>
              <h3 className="text-3xl font-bold text-[var(--text)] tracking-tight mb-4 -mt-8">
                {cat.title}
              </h3>
              <p className="text-[var(--muted)] leading-relaxed mb-6">{cat.description}</p>
              <blockquote className="border-l-2 border-[var(--accent)] pl-4 text-sm text-[var(--muted)] italic leading-relaxed">
                &ldquo;{cat.insight}&rdquo;
              </blockquote>
            </div>

            {/* Right: logo showcase — organic staggered layout */}
            <div className="flex flex-wrap items-start gap-3 content-start pt-2">
              {cat.logos.map((item, i) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  style={{ marginTop: item.offset ?? 0 }}
                >
                  <LogoChip item={item} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
