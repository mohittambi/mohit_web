import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "event-driven-sagas-recovery",
  title: "Event-Driven Sagas: Compensations, Timeouts, and Human-in-the-Loop Recovery",
  description:
    "Long-running business processes across services: orchestration choices, failure isolation, and safe recovery.",
  publishedAt: "2026-04-09",
  readTime: "10 min read",
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
      text: "Timeouts are not errors—they are transitions",
    },
    {
      kind: "p",
      text: "Model each wait state with deadlines and escalation paths. Compensation handlers should be idempotent and safe if they run twice. For irreversible steps, split “request” from “commit” and document which human role can force completion or rollback.",
    },
  ],
};
