"use client";

import { useState, useCallback } from "react";
import { hapticCommit } from "@/lib/haptics";

type Mode = "lambda" | "ecs";

function Box({
  label,
  sub,
  variant = "neutral",
}: {
  label: string;
  sub?: string;
  variant?: "neutral" | "accent" | "warn";
}) {
  const cls =
    variant === "accent"
      ? "border-[var(--accent)]/45 bg-[var(--accent-muted)] text-[var(--accent)]"
      : variant === "warn"
        ? "border-[var(--danger)]/35 bg-[var(--danger)]/10 text-[var(--muted)]"
        : "border-[var(--border-color)] bg-[var(--bg)] text-[var(--muted)]";
  return (
    <div
      className={`px-2.5 py-1.5 border rounded-[2px] text-[11px] font-mono font-medium whitespace-nowrap shrink-0 ${cls}`}
    >
      {label}
      {sub ? <span className="block text-[10px] opacity-75 font-normal leading-tight mt-0.5">{sub}</span> : null}
    </div>
  );
}

function Arrow({ vertical }: { vertical?: boolean }) {
  return vertical ? (
    <div className="flex flex-col items-center gap-0 self-stretch my-0.5">
      <div className="w-px flex-1 min-h-[10px] bg-[var(--border-color)]" />
      <span className="text-[8px] text-[var(--muted)]/60 leading-none">▼</span>
    </div>
  ) : (
    <div className="flex items-center shrink-0">
      <div className="w-3 h-px bg-[var(--border-color)]" />
      <span className="text-[8px] text-[var(--muted)]/60 leading-none px-0.5">▶</span>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-y-2 gap-x-0.5 justify-center sm:justify-start">{children}</div>;
}

function LambdaDiagram() {
  return (
    <div className="space-y-5 pt-1">
      <p className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wide">
        One concurrent request → one sandboxed execution → separate TCP fan-out at burst.
      </p>
      <Row>
        <Box label="Client" />
        <Arrow />
        <Box label="API GW" />
        <Arrow />
        <Box label="λ × N" variant="accent" sub="VPC ENI attach" />
        <Arrow />
        <Box label="Datastore" sub="N × new handshakes" variant="warn" />
      </Row>
      <div className="flex justify-center sm:justify-start pl-0 sm:pl-32">
        <div className="flex flex-col items-center">
          <Arrow vertical />
          <span className="text-[10px] font-mono text-[var(--muted)]/70 mt-1 max-w-[14rem] text-center">
            Cold start + scale-out = connection storms
          </span>
        </div>
      </div>
    </div>
  );
}

function EcsDiagram() {
  return (
    <div className="space-y-5 pt-1">
      <p className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wide">
        Long-lived tasks → pooled connections → predictable tail latency.
      </p>
      <Row>
        <Box label="Client" />
        <Arrow />
        <Box label="API GW" />
        <Arrow />
        <Box label="ALB" variant="accent" />
        <Arrow />
        <Box label="ECS / Fargate" variant="accent" sub="event loop · pool" />
        <Arrow />
        <Box label="Datastore" sub="shared pool / keep-alive" />
      </Row>
      <div className="rounded-[2px] border border-[var(--border-color)] bg-[var(--bg)] px-3 py-2 font-mono text-[10px] text-[var(--muted)] leading-relaxed">
        pg-pool · AWS SDK keepAlive · bounded concurrency per task
      </div>
    </div>
  );
}

export type ArchitectureToggleProps = Readonly<{
  /** Reserved for future variants (e.g. DynamoDB diagrams). */
  variant?: "lambda_ecs";
}>;

export function ArchitectureToggle({ variant = "lambda_ecs" }: ArchitectureToggleProps) {
  const [mode, setMode] = useState<Mode>("lambda");

  const select = useCallback((next: Mode) => {
    setMode(next);
    hapticCommit();
  }, []);

  if (variant !== "lambda_ecs") {
    return null;
  }

  return (
    <figure
      className="my-8 rounded-[2px] border border-[var(--border-color)] bg-[var(--surface)] p-4 sm:p-5"
      aria-label="Compare Lambda burst path vs ECS pooled path"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <figcaption className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)]">
          Ingress · connection model
        </figcaption>
        <div
          role="tablist"
          aria-label="Architecture comparison"
          className="flex w-full sm:w-auto border border-[var(--border-color)] rounded-[2px] p-0.5 gap-0.5 bg-[var(--bg)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "lambda"}
            id="arch-tab-lambda"
            aria-controls="arch-panel-lambda-ecs"
            className={`flex-1 sm:flex-none min-h-[44px] px-4 rounded-[2px] text-[12px] font-mono font-medium transition-colors duration-150 ${
              mode === "lambda"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
            }`}
            onClick={() => select("lambda")}
          >
            Lambda
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "ecs"}
            id="arch-tab-ecs"
            aria-controls="arch-panel-lambda-ecs"
            className={`flex-1 sm:flex-none min-h-[44px] px-4 rounded-[2px] text-[12px] font-mono font-medium transition-colors duration-150 ${
              mode === "ecs"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
            }`}
            onClick={() => select("ecs")}
          >
            ECS Fargate
          </button>
        </div>
      </div>

      <div
        role="tabpanel"
        id="arch-panel-lambda-ecs"
        aria-labelledby={mode === "lambda" ? "arch-tab-lambda" : "arch-tab-ecs"}
        className="border-t border-[var(--border-color)] pt-5"
      >
        <div className="transition-opacity duration-150" key={mode}>
          {mode === "lambda" ? <LambdaDiagram /> : <EcsDiagram />}
        </div>
      </div>
    </figure>
  );
}
