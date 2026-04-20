import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "llm-api-token-budgets",
  title: "LLM API Usage: Token Budgets, Model Routing, and Per-Feature Cost Attribution",
  description:
    "Making LLM spend predictable: budgets, routing rules, and telemetry that ties dollars to product surfaces.",
  publishedAt: "2026-04-13",
  readTime: "9 min read",
  difficulty: "Intermediate",
  tags: ["LLM", "Cost", "FinOps", "APIs"],
  sections: [
    {
      kind: "p",
      text: "Token meters belong next to request logs. Without per-feature attribution, every team assumes someone else owns the bill spike. Start by tagging every call with product area, tenant tier, and workflow id -- then the routing decision becomes obvious.",
    },
    {
      kind: "h2",
      text: "The model rate card: tiers are not optional",
    },
    {
      kind: "p",
      text: "Most teams default all traffic to a frontier model and discover the bill after the fact. The economics only work if you treat LLMs as tiered compute: route cheap utility tasks to cheap models and reserve expensive models for the tail that actually needs them.",
    },
    {
      kind: "cost_table",
      title: "Illustrative API rate card -- per 1M tokens (April 2026 placeholders, verify at publish)",
      headers: ["Model tier", "Input ($/1M)", "Output ($/1M)", "Best for"],
      rows: [
        ["GPT-5.4 Pro (illustrative)", "$30.00", "$180.00", "High-stakes logic, complex coding"],
        ["GPT-5.4 Standard (illustrative)", "$2.50", "$15.00", "Advanced reasoning, creative work"],
        ["Gemini 3.1 Pro (illustrative)", "$2.00", "$12.00", "Long-context RAG"],
        ["Gemini 3.1 Flash (illustrative)", "$0.50", "$3.00", "Real-time chat, tool use"],
        ["Gemini 3.1 Lite (illustrative)", "$0.25", "$1.50", "Classification, extraction, routing"],
      ],
      note: "Pro-only defaults are a FinOps liability once volume exists. Routing is the economic architecture move -- not prompt optimisation alone.",
    },
    {
      kind: "h2",
      text: "The 80/20 routing math",
    },
    {
      kind: "p",
      text: "Route 80% of traffic -- classification, extraction, formatting, routing calls themselves -- through the cheapest capable model. Reserve the remaining 20% for synthesis, multi-step reasoning, and tasks where accuracy is revenue-critical. The savings are non-linear because cheap models are an order of magnitude cheaper, not 20% cheaper.",
    },
    {
      kind: "prompt_example",
      title: "Naive vs routed -- 10M tokens/month cost comparison",
      after: {
        label: "Cost breakdown (authoring scenario -- recompute with your blend)",
        language: "plaintext",
        code: `-- Scenario A: naive (100% GPT-5.4 Standard) --
Blended effective rate: ~$17.50 / M tokens (3:1 input:output ratio)
10M tokens x $17.50 = ~$175 / month

-- Scenario B: routed (80/20 split) --
80% -> Gemini 3.1 Lite at blended ~$1.75 / M
  8M x $1.75 = ~$14 / month
20% -> GPT-5.4 Standard at blended ~$17.50 / M
  2M x $17.50 = ~$35 / month
Total: ~$49 / month

-- Savings: ($175 - $49) / $175 = ~72% --

Savings ratio grows when the cheap lane is lighter
(Flash/Lite-class) or Standard share shrinks after eval gates.
Router cost: a thin Lite call per request adds tokens --
usually second-order to mis-routing everything to Pro.`,
      },
      note: "Show one worked table with explicit blend definition (e.g. 3:1 input:output). State your token volume definition: billed input+output or input-only -- pick one and stick to it.",
    },
    {
      kind: "h2",
      text: "Budgets as product constraints",
    },
    {
      kind: "p",
      text: "Soft caps trigger summarisation or cheaper models; hard caps return graceful degradation. Expose remaining budget to the UX for long sessions so power users understand why depth was trimmed. Finance should see the same dimensions you use for alerts.",
    },
    {
      kind: "h2",
      text: "Instrumentation: the metadata blueprint",
    },
    {
      kind: "p",
      text: "To attribute spend and tune routing, every LLM call should carry a consistent dimension set. Build this as middleware or gateway middleware so it is not optional for individual features.",
    },
    {
      kind: "cost_table",
      title: "Metadata blueprint -- mandatory tagging dimensions",
      headers: ["Dimension", "Example value", "Purpose"],
      rows: [
        ["feature", "supply-chain-extraction", "Stable catalog id, not free text"],
        ["tenant", "enterprise-a", "Align with billing entity"],
        ["workflow", "intent/hts-classification", "Drives routing table keys"],
        ["model_chosen", "gemini-3.1-lite", "Post-decision log"],
        ["outcome", "success | validation_fail | user_abort", "Feeds value metrics, not only cost"],
      ],
      note: "Propagate headers (x-tenant-id, x-feature-id, x-workflow-id) into structured logs and metric labels. Never duplicate payloads or PII into observability backends -- mask or omit raw prompts in shared dashboards.",
    },
    {
      kind: "h2",
      text: "Model routing",
    },
    {
      kind: "p",
      text: "Route by task class: small models for classification and extraction, larger models for synthesis and multi-step reasoning. Cache deterministic sub-results. Re-evaluate routing when pricing or latency curves move -- routing tables deserve version control and canary analysis like any other config.",
    },
    {
      kind: "p",
      text: "Unit economics matter beyond total spend: track **cost per successful feature action**, not only rising spend bars. A $0.10 model call that unblocks a revenue workflow reads differently from a $0.001 call that fails silently. Pair cost dashboards with outcome dashboards so routing decisions are grounded in value, not just savings.",
    },
    {
      kind: "region_note",
      region: "ap-south-1 (Mumbai)",
      paragraphs: [
        "LLM API list pricing is typically global, but data transfer out of Mumbai VPCs to third-party API endpoints adds a small percentage tax at very large context volumes. Treat ~2-3% as illustrative; measure with VPC flow logs and billing dimensions.",
        "Optimization angle: run Gemini via Vertex AI in ap-south-1 (or equivalent regional inference) so bulk traffic stays on provider backbone paths you can contract and monitor, instead of routing all traffic to a distant global endpoint when latency and egress both matter.",
        "NAT Gateway data-processing in Mumbai ($0.045/GB) applies to any VPC-private Lambda or ECS function making outbound LLM API calls. At 10M tokens/month with 2 KB average payload, that is ~20 GB outbound, or ~$0.90/mo from NAT alone -- at 100M tokens it becomes ~$9/mo and worth a VPC endpoint evaluation.",
      ],
    },
  ],
};
