import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook: "If Finance hears about LLM cost before Engineering has dimensions, you have already lost the narrative.",
  strongVisual:
    "Stacked bar: token spend by product surface vs one flat “OpenAI bill” line—same month, opposite clarity.",
  linkedInThread: [
    "LLM cost is an instrumentation problem first: if Finance sees a flat vendor line and Engineering has no dimensions, you lose the narrative.",
    "Minimum tags that actually work: product area, tenant tier, workflow id, model id—then dashboards can mirror finance rollups.",
    "Soft cap vs hard cap need different UX copy; silent truncation is trust arson.",
    "OpenAI usage tiers & rate limits (read before you promise SLAs): https://platform.openai.com/docs/guides/rate-limits",
    `${blogPostUrl("llm-api-token-budgets")} — token budgets, routing, per-feature attribution.`,
    "How do you tag LLM calls today—dimensions per call, and who owns the dashboard?",
  ],
  diagramBrief: {
    title: "LLM cost control plane",
    elements: [
      "Ingress: every call tagged (feature / tenant / workflow)—bottleneck if async logging drops.",
      "Router: arrows to small vs large model; X on “always largest” path.",
      "Budget service: soft threshold → summarise; hard threshold → block—show retry storm if misconfigured.",
      "Finance mirror: same rollup dimensions; dashed line “invoice reconciliation.”",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Middleware tags on every provider call; drop health checks from LLM paths.",
      "One dashboard: tokens, $ estimate, p95 latency, error rate by feature.",
      "Document soft vs hard cap policy with product + legal for customer-facing copy.",
    ],
    month1: [
      "Routing table by task class; pin models in prod, float in sandbox.",
      "Chargeback/showback deck monthly—engineering owns explanation, not FP&A guessing.",
      "Anomaly alerts: tier burn vs baseline, not global bill spike only.",
    ],
    scale: [
      "Per-tenant fairness queues; abuse isolation without starving good tenants.",
      "Reserved capacity / committed spend where vendor economics justify; re-evaluate quarterly.",
      "Cost-aware product roadmap: ship kill switches for expensive experimental features.",
    ],
  },
  interview30Sec:
    "I tag every LLM call with product, tenant, and workflow, expose soft and hard budgets with honest UX, and route cheap tasks to small models. Finance sees the same dimensions Engineering uses so cost conversations are factual, not political.",
  cto1Min:
    "Week one I instrument before I optimise—tags, a single dashboard, and a written cap policy co-owned with product. Month one I add routing in version control with canaries and monthly showback. At scale I care about fairness between tenants, abuse isolation, and roadmap-level kill switches so experimental features cannot silently tax the whole business.",
};
