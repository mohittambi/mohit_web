import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "event-driven-sagas-recovery",
  title: "Event-Driven Sagas: Compensations, Timeouts, and Human-in-the-Loop Recovery",
  description:
    "Long-running business processes across services: orchestration choices, failure isolation, and safe recovery.",
  publishedAt: "2026-04-09",
  readTime: "10 min read",
  difficulty: "Deep dive",
  tags: ["Saga", "Events", "Microservices", "Architecture"],
  sections: [
    {
      kind: "p",
      text: "Distributed sagas fail in partial states. Your design must answer: who decides the next step, how compensations are ordered, and what happens when a human must intervene.",
    },
    {
      kind: "h2",
      text: "Choreography vs orchestration",
    },
    {
      kind: "p",
      text: "Choreography reduces coupling but obscures global progress; orchestration centralises state at the cost of a critical service. Many teams start choreographed and introduce an orchestrator when debugging becomes untenable. Either way, persist explicit saga state with timestamps and correlation ids.",
    },
    {
      kind: "h2",
      text: "Timeouts are not errors -- they are transitions",
    },
    {
      kind: "p",
      text: "Model each wait state with deadlines and escalation paths. Compensation handlers should be idempotent and safe if they run twice. For irreversible steps, split 'request' from 'commit' and document which human role can force completion or rollback.",
    },
    {
      kind: "h2",
      text: "The retry storm bill",
    },
    {
      kind: "p",
      text: "Infinite-retry configurations look safe until a poison payload or downstream outage triggers a cascade. At Step Functions standard pricing, each state transition is a billing event -- retry loops compound that cost while blocking other work.",
    },
    {
      kind: "cost_note",
      label: "FinOps note -- retry storm economics",
      paragraphs: [
        "**Step Functions standard workflows (ap-south-1 authoring):** $0.025 per 1,000 state transitions. A saga with 10 states and 50 retries per failed execution = 500 transitions per failed saga. At 1M failed sagas/month: 500M transitions x $0.025/1k = **$12,500/mo** in state-transition charges alone.",
        "**Lambda execution cost compounds.** Each retry invokes the Lambda handler, re-reads state, and potentially re-bills DynamoDB read/write units. A 256 MB Lambda with 2s duration: $0.00001333 x 512 MB-sec x 50 retries = **$0.34 per failed saga**. At 1M failed sagas: **$340k/mo** -- well beyond the transition cost.",
        "**Fix:** cap MaxAttempts at 3-5 with exponential backoff and dead-letter the saga to a human-reviewable queue. Infinite retry is an architectural decision, not a safety net. Model the retry budget in the same design doc as the saga state machine.",
      ],
      formula: "monthly_transition_cost = failed_sagas * states_per_saga * retries * (0.025 / 1000)\nmonthly_lambda_cost = failed_sagas * retries * duration_sec * memory_gb * 0.00001333",
    },
    {
      kind: "h2",
      text: "DLQ-first recovery design",
    },
    {
      kind: "p",
      text: "Dead-letter every saga execution that exhausts retries to an SQS DLQ with sufficient retention (7+ days). Attach a dashboard showing DLQ depth and age. Replay tooling should be idempotent -- a saga replayed twice must produce the same business outcome as one played once. Document which ordering constraints apply and what 'done' looks like before you ship the replay button.",
    },
  ],
};
