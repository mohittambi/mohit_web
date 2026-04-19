"use client";

import { motion } from "framer-motion";
import { ArrowDown, BookOpen, Calendar } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";

const stats = [
  { value: "10+",    label: "Years Experience"    },
  { value: "7M+",    label: "Users at Scale"       },
  { value: "$9K/mo", label: "Infrastructure Saved" },
  { value: "99.99%", label: "Uptime Delivered"     },
];

const CODE_LINES = [
  "const router = new EventRouter({ maxConcurrency: 2000 });",
  "await Promise.all(shards.map(s => s.rebalance()));",
  "class DistributedLock { async acquire(ttl = 30_000) {",
  "  if (await this.redis.set(key, id, 'NX', 'PX', ttl))",
  "export const handler = middy(fn).use(warmup());",
  "@Retry({ maxAttempts: 3, backoff: ExponentialBackoff })",
  "const trace = tracer.startSpan('checkout.process');",
  "SELECT * FROM wallets WHERE version = $1 FOR UPDATE;",
  "new SQSEventBridge({ dlq: true, visibility: 300 });",
  "if (lag > THRESHOLD) await scaleOut(cluster, +2);",
  "const [hit, miss] = partition(keys, cache.has);",
  "Task.create({ saga: 'order', step: 'reserve-stock' });",
  "await outboxPoller.flush({ batchSize: 500 });",
  "helm upgrade --atomic --timeout 5m platform ./chart",
  "curl -s metrics:9090/query?q=p99_latency{env='prod'}",
  "ALTER TABLE events ADD COLUMN idempotency_key TEXT UNIQUE;",
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center hero-gradient pt-16 overflow-hidden">
      {/* Code watermark */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none" aria-hidden="true">
        {CODE_LINES.map((line, i) => (
          <div
            key={line}
            className="absolute whitespace-nowrap font-mono text-[11px] text-[var(--accent)] opacity-[0.045] dark:opacity-[0.06]"
            style={{
              top: `${(i / CODE_LINES.length) * 100}%`,
              left: `${(i % 2 === 0 ? -2 : 30)}%`,
              transform: `rotate(-6deg)`,
              animation: `code-drift ${18 + i * 1.2}s linear infinite`,
              animationDelay: `${-i * 2.1}s`,
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 w-full text-center relative z-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-color)] bg-[var(--surface)] text-xs text-[var(--muted)] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
          Principal Engineer · Distributed Systems · Cloud Architecture
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] tracking-tight leading-tight mb-6 max-w-4xl mx-auto"
        >
          I design and scale distributed systems that survive{" "}
          <span className="text-[var(--accent)]">
            real-world traffic, failures, and business pressure.
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          A decade of building backend systems at scale — migrations, reconciliation engines,
          event-driven pipelines, and the kind of infrastructure decisions that keep businesses running.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <a
            href="#work"
            className="inline-flex items-center h-11 px-6 rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            View Work
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-md text-sm font-medium border border-[var(--border-color)] text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          >
            <Calendar size={16} />
            Schedule a Call
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-14"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center p-4 rounded-lg border border-[var(--border-color)] bg-[var(--surface)]"
            >
              <span className="text-2xl font-bold text-[var(--accent)]">{s.value}</span>
              <span className="text-xs text-[var(--muted)] mt-1 text-center">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-4 mb-14"
        >
          <a
            href="https://github.com/mohittambi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <GithubIcon size={16} /> GitHub
          </a>
          <span className="text-[var(--border-color)]">·</span>
          <a
            href="https://www.linkedin.com/in/mohit-tambi/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <LinkedinIcon size={16} /> LinkedIn
          </a>
          <span className="text-[var(--border-color)]">·</span>
          <a
            href="https://medium.com/@er.mohittambi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <BookOpen size={16} /> Medium
          </a>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex justify-center"
        >
          <a href="#about" className="text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            <ArrowDown size={20} className="animate-bounce" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
