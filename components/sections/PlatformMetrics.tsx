"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

/* ── Sparkline data ─────────────────────────────────────────── */
const DATA = {
  before: {
    throughput: [820, 1100, 780, 960, 640, 1200, 580, 1240],
    latency:    [280, 320, 410, 380, 490, 360, 440, 380],
    errorRate:  [0.4, 0.6, 1.1, 0.8, 1.4, 0.7, 0.9, 0.8],
    cost:       [4800, 5100, 5300, 5200, 5500, 5400, 5350, 5400],
  },
  after: {
    throughput: [2400, 2650, 2820, 2780, 2900, 2840, 2960, 2840],
    latency:    [52,  48,  55,  44,  49,  47,  51,  47],
    errorRate:  [0.004, 0.003, 0.005, 0.003, 0.002, 0.003, 0.004, 0.003],
    cost:       [3400, 3300, 3250, 3200, 3180, 3200, 3220, 3200],
  },
};

type Phase = "before" | "after";

/* ── Sparkline SVG ──────────────────────────────────────────── */
function Sparkline({
  data,
  positive,
}: Readonly<{ data: number[]; positive: boolean }>) {
  const w = 100, h = 36;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const color = positive ? "#22c55e" : "#ef4444";
  const fillId = `fill-${positive}-${pts.slice(0, 8)}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#${fillId})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Metric card ─────────────────────────────────────────────── */
interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  beforeVal: string;
  afterVal: string;
  delta: string;
  positiveIsUp: boolean;   // true = higher value is better
  phase: Phase;
  sparkBefore: number[];
  sparkAfter: number[];
  unit?: string;
}

function MetricCard({
  icon: Icon,
  label,
  beforeVal,
  afterVal,
  delta,
  positiveIsUp,
  phase,
  sparkBefore,
  sparkAfter,
  unit = "",
}: Readonly<MetricCardProps>) {
  const value = phase === "after" ? afterVal : beforeVal;
  const spark = phase === "after" ? sparkAfter : sparkBefore;
  const improved = phase === "after";
  const trendUp = positiveIsUp ? improved : !improved;

  return (
    <motion.div
      layout
      className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
            <Icon size={14} className="text-[var(--accent)]" />
          </div>
          <span className="text-xs font-medium text-[var(--muted)]">{label}</span>
        </div>
        {improved && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${trendUp ? "text-green-500" : "text-red-400"}`}
          >
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {delta}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="text-2xl font-bold text-[var(--text)] tabular-nums"
        >
          {value}
          {unit && <span className="text-sm font-normal text-[var(--muted)] ml-1">{unit}</span>}
        </motion.p>
      </AnimatePresence>

      <Sparkline data={spark} positive={trendUp} />
    </motion.div>
  );
}

/* ── Live status dots ────────────────────────────────────────── */
function LiveDots({ phase }: Readonly<{ phase: Phase }>) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(id);
  }, []);

  const dots = [
    { label: "Throughput", ok: phase === "after" || tick % 4 !== 0 },
    { label: "Latency SLA", ok: phase === "after" || tick % 6 !== 0 },
    { label: "Error Budget", ok: phase === "after" || tick % 3 !== 0 },
    { label: "Cost target", ok: phase === "after" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {dots.map((d) => (
        <div key={d.label} className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              d.ok
                ? "bg-green-500" + (phase === "before" ? " animate-pulse" : "")
                : "bg-amber-400 animate-pulse"
            }`}
          />
          <span className="text-xs text-[var(--muted)]">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Architecture flow ───────────────────────────────────────── */
function ArchFlow({ phase }: Readonly<{ phase: Phase }>) {
  return (
    <div className="mt-6 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg)] overflow-x-auto">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
        Request flow — {phase === "before" ? "Lambda (before)" : "ECS Fargate (after)"}
      </p>
      <div className="flex items-center gap-2 text-xs flex-nowrap min-w-max">
        {[
          { label: "Client", color: "bg-[var(--surface)] border-[var(--border-color)] text-[var(--muted)]" },
          null,
          { label: "API Gateway", color: "bg-[var(--surface)] border-[var(--border-color)] text-[var(--muted)]" },
          null,
          { label: "ALB", color: "bg-[var(--surface)] border-[var(--border-color)] text-[var(--muted)]" },
          null,
          phase === "before"
            ? { label: "λ Lambda", color: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400" }
            : { label: "ECS Fargate", color: "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]" },
          null,
          { label: "SQS / SNS", color: "bg-[var(--surface)] border-[var(--border-color)] text-[var(--muted)]" },
          null,
          { label: "DynamoDB", color: "bg-[var(--surface)] border-[var(--border-color)] text-[var(--muted)]" },
          null,
          { label: "Redis Cache", color: "bg-[var(--surface)] border-[var(--border-color)] text-[var(--muted)]" },
        ].map((node, i) =>
          node === null ? (
            <div key={i} className="flex items-center gap-0.5 text-[var(--muted)]/40 select-none">
              <div className="w-4 h-px bg-[var(--border-color)]" />
              <span className="text-[10px]">▶</span>
            </div>
          ) : (
            <motion.div
              key={node.label}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`px-3 py-1.5 rounded-lg border font-medium whitespace-nowrap ${node.color}`}
            >
              {node.label}
            </motion.div>
          )
        )}
      </div>

      {phase === "before" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5"
        >
          <AlertTriangle size={12} />
          Cold starts under burst traffic · concurrency throttling · stateless constraint
        </motion.p>
      )}
      {phase === "after" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5"
        >
          <Zap size={12} />
          Persistent connections · in-memory cache · horizontal scaling · zero cold starts
        </motion.p>
      )}
    </div>
  );
}

/* ── Main section ────────────────────────────────────────────── */
export function PlatformMetrics() {
  const [phase, setPhase] = useState<Phase>("before");
  const [autoplay, setAutoplay] = useState(true);

  const toggle = useCallback(() => {
    setPhase((p) => (p === "before" ? "after" : "before"));
    setAutoplay(false);
  }, []);

  // Auto-advance once to "after" after 2.5s to show the magic
  useEffect(() => {
    if (!autoplay) return;
    const id = setTimeout(() => setPhase("after"), 2500);
    return () => clearTimeout(id);
  }, [autoplay]);

  const metrics: MetricCardProps[] = [
    {
      icon: Zap,
      label: "Throughput",
      beforeVal: "1,240",
      afterVal: "2,840",
      delta: "+129%",
      positiveIsUp: true,
      unit: "req/s",
      phase,
      sparkBefore: DATA.before.throughput,
      sparkAfter: DATA.after.throughput,
    },
    {
      icon: Clock,
      label: "p95 Latency",
      beforeVal: "380ms",
      afterVal: "47ms",
      delta: "−88%",
      positiveIsUp: false,
      phase,
      sparkBefore: DATA.before.latency,
      sparkAfter: DATA.after.latency,
    },
    {
      icon: AlertTriangle,
      label: "Error Rate",
      beforeVal: "0.8%",
      afterVal: "0.003%",
      delta: "−99%",
      positiveIsUp: false,
      phase,
      sparkBefore: DATA.before.errorRate,
      sparkAfter: DATA.after.errorRate,
    },
    {
      icon: DollarSign,
      label: "Monthly Infra Cost",
      beforeVal: "$5,400",
      afterVal: "$3,200",
      delta: "−41%",
      positiveIsUp: false,
      unit: "/mo",
      phase,
      sparkBefore: DATA.before.cost,
      sparkAfter: DATA.after.cost,
    },
  ];

  return (
    <section id="metrics" className="py-24 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            label="Live Impact"
            title="Platform before and after."
            description="Real production numbers from the Lambda → ECS Fargate migration. Toggle between states to see the impact."
          />
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg)] w-fit mb-8">
          {(["before", "after"] as Phase[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPhase(p); setAutoplay(false); }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                phase === p
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {p === "before" ? "λ Lambda (before)" : "⬡ ECS Fargate (after)"}
            </button>
          ))}
          {autoplay && phase === "before" && (
            <span className="text-xs text-[var(--muted)] pl-2 pr-1 animate-pulse">
              switching…
            </span>
          )}
        </div>

        {/* Metric cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {/* Status row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg)] mb-2">
          <div>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest mb-2">
              SLA Health
            </p>
            <LiveDots phase={phase} />
          </div>
          <button
            onClick={toggle}
            className="text-xs px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40 transition-all"
          >
            {phase === "before" ? "See what changed →" : "Compare with before ←"}
          </button>
        </div>

        {/* Architecture flow */}
        <ArchFlow phase={phase} />

        <p className="mt-4 text-xs text-[var(--muted)] text-center">
          Numbers from production monitoring · A23.com platform · Jan 2023 – Oct 2025
        </p>
      </div>
    </section>
  );
}
