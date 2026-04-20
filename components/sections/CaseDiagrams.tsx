/* Architecture diagrams rendered inside each case-study accordion */

/* ── Shared primitives ───────────────────────────────────────── */
function Node({
  label,
  sub,
  tone = "neutral",
}: {
  label: string;
  sub?: string;
  tone?: "neutral" | "accent" | "amber" | "green" | "rose" | "sky";
}) {
  const colors: Record<string, string> = {
    neutral: "border-[var(--border-color)] bg-[var(--surface)] text-[var(--muted)]",
    accent:  "border-[var(--accent)]/40 bg-[var(--accent)]/8 text-[var(--accent)]",
    amber:   "border-amber-500/40 bg-amber-500/8 text-amber-600 dark:text-amber-400",
    green:   "border-emerald-500/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400",
    rose:    "border-rose-500/40 bg-rose-500/8 text-rose-600 dark:text-rose-400",
    sky:     "border-sky-500/40 bg-sky-500/8 text-sky-700 dark:text-sky-400",
  };
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap shrink-0 ${colors[tone]}`}>
      {label}
      {sub && <span className="block text-[10px] opacity-60 font-normal leading-tight">{sub}</span>}
    </div>
  );
}

function Arrow({ vertical }: { vertical?: boolean }) {
  return vertical ? (
    <div className="flex flex-col items-center gap-0 self-stretch my-0.5">
      <div className="w-px flex-1 bg-[var(--border-color)]" />
      <span className="text-[8px] text-[var(--muted)]/50 leading-none">▼</span>
    </div>
  ) : (
    <div className="flex items-center gap-0 shrink-0">
      <div className="w-4 h-px bg-[var(--border-color)]" />
      <span className="text-[8px] text-[var(--muted)]/50 leading-none">▶</span>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center flex-wrap gap-1">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]/60 mb-2">
      {children}
    </p>
  );
}

function DiagramShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg)] p-5 overflow-x-auto">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ── 1. Lambda → ECS Migration ───────────────────────────────── */
export function DiagramLambdaToEcs() {
  return (
    <DiagramShell title="Architecture — before vs after">
      <div className="space-y-4">
        <div>
          <Label>Before — Lambda (cold-start path)</Label>
          <Row>
            <Node label="Client" />
            <Arrow />
            <Node label="API Gateway" />
            <Arrow />
            <Node label="λ Lambda" sub="cold start + throttle" tone="amber" />
            <Arrow />
            <Node label="DynamoDB" tone="neutral" />
          </Row>
        </div>

        <div className="border-t border-[var(--border-color)] pt-4">
          <Label>After — ECS Fargate (persistent + cached)</Label>
          <div className="space-y-1.5">
            <Row>
              <Node label="Client" />
              <Arrow />
              <Node label="API Gateway" />
              <Arrow />
              <Node label="ALB" tone="sky" />
              <Arrow />
              <Node label="ECS Fargate" sub="persistent · clustered" tone="green" />
              <Arrow />
              <Node label="Redis" sub="in-memory cache" tone="accent" />
            </Row>
            <div className="pl-[232px]">
              <div className="flex items-center gap-1 ml-2">
                <Arrow vertical />
                <span className="text-[10px] text-[var(--muted)]/60 ml-1 whitespace-nowrap">fallthrough on miss</span>
              </div>
              <div className="ml-3">
                <Node label="DynamoDB" tone="neutral" />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { label: "Blue-green deploy", tone: "accent" as const },
              { label: "GitHub Actions → ECR → ECS", tone: "neutral" as const },
              { label: "CloudWatch auto-scale", tone: "neutral" as const },
            ].map((b) => (
              <Node key={b.label} label={b.label} tone={b.tone} />
            ))}
          </div>
        </div>
      </div>
    </DiagramShell>
  );
}

/* ── 2. Wallet Reconciliation Engine ─────────────────────────── */
export function DiagramWalletReconciliation() {
  return (
    <DiagramShell title="Event flow — idempotent reconciliation">
      <div className="space-y-4">
        <Row>
          <Node label="Transaction API" tone="sky" />
          <Arrow />
          <Node label="Outbox Writer" sub="transactional" tone="accent" />
          <Arrow />
          <Node label="SQS FIFO" sub="ordered delivery" tone="neutral" />
          <Arrow />
          <Node label="Dedup Processor" sub="event-id check" tone="green" />
          <Arrow />
          <Node label="DynamoDB" sub="event store" tone="neutral" />
        </Row>

        <div className="flex items-start gap-6 pt-1 pl-2">
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] text-[var(--muted)]/60 whitespace-nowrap">PostgreSQL</div>
            <div className="text-[10px] text-[var(--muted)]/60 whitespace-nowrap">write-ahead</div>
          </div>
          <div className="h-px w-6 bg-[var(--border-color)] mt-2.5 shrink-0" />
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] text-[var(--muted)]/60 whitespace-nowrap">Balance Projector</div>
            <div className="text-[10px] text-[var(--muted)]/60 whitespace-nowrap">point-in-time replay</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-color)]">
          <Node label="Exact-once guarantee" tone="green" />
          <Node label="Full audit replay" tone="accent" />
          <Node label="Zero balance drift" tone="green" />
        </div>
      </div>
    </DiagramShell>
  );
}

/* ── 3. High-Throughput Event Pipeline ───────────────────────── */
export function DiagramEventPipeline() {
  return (
    <DiagramShell title="SNS fan-out topology — independent consumer scaling">
      <div className="space-y-3">
        <Row>
          <Node label="Producer" tone="sky" />
          <Arrow />
          <Node label="SNS Topic" sub="schema registry" tone="accent" />
          <div className="flex flex-col gap-2 ml-1">
            {[
              { q: "SQS Queue A", c: "Consumer A", sla: "real-time" },
              { q: "SQS Queue B", c: "Consumer B", sla: "async" },
              { q: "SQS Queue C", c: "Consumer C", sla: "batch" },
            ].map(({ q, c, sla }) => (
              <div key={q} className="flex items-center gap-1">
                <Arrow />
                <Node label={q} tone="neutral" />
                <Arrow />
                <Node label={c} sub={sla} tone="green" />
              </div>
            ))}
          </div>
        </Row>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-color)]">
          <Node label="DLQ + exponential backoff" tone="rose" />
          <Node label="Per-consumer lag dashboard" tone="neutral" />
          <Node label="Isolated failure blast radius" tone="green" />
        </div>
      </div>
    </DiagramShell>
  );
}

/* ── 4. Dynamic Config Platform ──────────────────────────────── */
export function DiagramConfigPlatform() {
  return (
    <DiagramShell title="Push-invalidation config propagation">
      <div className="space-y-4">
        <Row>
          <Node label="Admin UI" tone="sky" />
          <Arrow />
          <Node label="Config API" sub="versioned + audited" tone="accent" />
          <Arrow />
          <Node label="DynamoDB" sub="versioned snapshots" tone="neutral" />
        </Row>

        <div className="pl-[120px] space-y-1">
          <div className="flex items-center gap-1">
            <Arrow />
            <Node label="Redis pub/sub" sub="push invalidation" tone="accent" />
            <Arrow />
            <div className="flex flex-col gap-1.5">
              {["Service A", "Service B", "Service C"].map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <Arrow />
                  <Node label={s} sub="local fallback cache" tone="green" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-color)]">
          <Node label="&lt;3 s propagation" tone="green" />
          <Node label="One-click rollback" tone="accent" />
          <Node label="No redeploy" tone="green" />
        </div>
      </div>
    </DiagramShell>
  );
}

export const CASE_DIAGRAMS: Record<string, React.FC> = {
  "lambda-to-ecs":         DiagramLambdaToEcs,
  "wallet-reconciliation": DiagramWalletReconciliation,
  "event-driven-pipeline": DiagramEventPipeline,
  "config-platform":       DiagramConfigPlatform,
};
