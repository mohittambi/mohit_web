import type { BlogPost } from "../types";

const ROUTER_MERMAID = `graph TD
    A[User Request] --> B{Semantic Router}

    B -- "Classification / Simple RAG" --> C[Gemini 3.1 Lite]
    B -- "Drafting / Logic" --> D[Claude 4.7 Sonnet]
    B -- "Requires Multi-step Reasoning" --> E[Claude 4.7 Opus]

    C --> F[Format Response]
    D --> F
    E --> F

    style C stroke:#00F0FF,stroke-width:2px
    style D stroke:#E5E7EB,stroke-width:1px
    style E stroke:#E5E7EB,stroke-width:1px`;

const LLM_TELEMETRY_SNIPPET = `import { Anthropic } from '@anthropic-ai/sdk';
import { metrics } from './datadog';

const anthropic = new Anthropic();

export async function invokeModel(prompt: string, context: { tenantId: string; featureId: string }) {
  // 1. Execute the call
  const response = await anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  // 2. Extract Token Usage
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;

  // 3. Calculate Exact Cent Cost
  const costUsd = (inputTokens * 0.000003) + (outputTokens * 0.000015);

  // 4. Emit to Observability Platform
  metrics.histogram('llm.request.cost', costUsd, [
    \`tenant:\${context.tenantId}\`,
    \`feature:\${context.featureId}\`,
    'model:claude-4.7-sonnet',
  ]);

  return response.content;
}`;

export const post: BlogPost = {
  slug: "llm-api-token-budgets",
  title: "LLM API Usage: Token Budgets, Model Routing, and Per-Feature Cost Attribution",
  description:
    "Opus tax vs utility tiers in ap-south-1, semantic router gatekeeping, Datadog-style cost histograms per tenant/feature, value-per-token framing, and a production FinOps checklist—so GenAI features do not eat gross margin.",
  publishedAt: "2026-04-13",
  readTime: "9 min read",
  difficulty: "Intermediate",
  tags: ["LLM", "Cost", "FinOps", "APIs", "Architecture"],
  sections: [
    {
      kind: "p",
      text: "In February 2026, one of our internal supply chain extraction agents fell into an infinite retry loop over a weekend. By Monday morning, a feature that usually cost `$50/day` had burned through `$1,200`.",
    },
    {
      kind: "p",
      text: "The root cause wasn't the loop itself—bugs happen. The root cause was that the engineers had hardcoded `claude-4.7-opus` as the default model for a trivial JSON formatting task.",
    },
    {
      kind: "p",
      text: "Treating an LLM API like a traditional REST API is a catastrophic financial mistake. Traditional APIs have flat or negligible compute costs per request. LLMs charge a variable, unbounded \"intelligence tax\" based on input length, output length, and reasoning depth.",
    },
    {
      kind: "p",
      text: "If you are scaling GenAI features in production, you cannot just look at your monthly AWS or Google Cloud bill. You need architectural model routing, strict token budgets, and per-feature cost attribution. Here is the FinOps blueprint.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: '1. The "Opus Tax" & The 2026 Rate Card',
    },
    {
      kind: "p",
      text: "In the `ap-south-1` region, the gap between \"Frontier\" models and \"Utility\" models is no longer marginal; it is an order of magnitude.",
    },
    {
      kind: "cost_table",
      title: "2026 rate card — illustrative $/1M tokens (verify at publish)",
      headers: ["Model tier", "Input ($/1M)", "Output ($/1M)", "Architectural role"],
      rows: [
        ["Claude 4.7 Opus", "$15.00", "$75.00", "High-stakes conflict resolution"],
        ["Claude 4.7 Sonnet", "$3.00", "$15.00", "Complex reasoning, formatting"],
        ["Gemini 3.1 Pro", "$2.00", "$10.00", "Massive contexts (1M+ tokens)"],
        ["Gemini 3.1 Lite", "$0.25", "$1.50", "Fast extraction, classification, routing"],
      ],
      note: "Rates are April 2026 authoring placeholders—replace with live vendor pricing and exact SKUs before publishing.",
    },
    {
      kind: "p",
      text: "If your application processes **10 million** tokens a month, a naive architecture defaulting to Opus costs **`$150+`**. A routed architecture utilizing Lite for **80%** of tasks costs **`~$20`**.",
    },
    {
      kind: "system_alert",
      label: "Principal's Note: The 80/20 Routing Rule",
      text:
        "Never use a frontier model to do a utility model's job. If you are extracting dates from an invoice, categorizing a user's intent, or summarizing a short chat, **Gemini 3.1 Lite** or **Claude Haiku** will achieve 99% of the accuracy at 1/60th of the cost. Reserve Opus for the final 5% of tasks where strategic reasoning is non-negotiable.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "2. The Semantic Router Architecture",
    },
    {
      kind: "p",
      text: 'You enforce the 80/20 rule by placing a **"Gatekeeper"** in front of your LLM calls. This is a fast, deterministic routing layer that evaluates the complexity of the request before spending money on it.',
    },
    { kind: "mermaid", code: ROUTER_MERMAID },
    {
      kind: "p",
      text: "**How it works:**",
    },
    {
      kind: "ol",
      items: [
        "A user uploads a supply chain document.",
        "The router uses a fast `regex` or a tiny embedded classifier (running locally) to detect keywords like \"legal dispute\" or \"contract violation.\"",
        "If no complex triggers are found, it routes the extraction prompt to the `$0.25` model.",
        "If it detects high-risk context, it escalates to the `$15.00` model.",
      ],
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "3. The Metadata Blueprint (Cost Attribution)",
    },
    {
      kind: "p",
      text: 'When the CFO asks, "Why did our Anthropic bill double this month?", answering "User engagement went up" is unacceptable. You must be able to say, "The \'Invoice Extractor\' feature saw a 40% spike in usage from Tenant A."',
    },
    {
      kind: "p",
      text: "To do this, you must wrap the official SDKs in a telemetry middleware that injects metadata into every single call.",
    },
    {
      kind: "code_block",
      language: "typescript",
      title: "middleware/llm-telemetry.ts",
      code: LLM_TELEMETRY_SNIPPET,
    },
    {
      kind: "p",
      text: "If you do not enforce this pattern, your LLM spend is a black box. By tagging `tenant_id` and `feature_id`, you can generate Grafana dashboards that calculate your actual **Cost of Goods Sold (COGS)** per tenant.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: '4. Measuring "Value per Token"',
    },
    {
      kind: "p",
      text: 'Once you have instrumentation, you must shift your mindset from "Cost Tracking" to "Value Tracking."',
    },
    {
      kind: "p",
      text: "An API call is only \"expensive\" if it fails to generate business value.",
    },
    {
      kind: "ul",
      items: [
        "A **`$0.001`** call to a cheap model that hallucinates an HTS code and delays a shipment at customs is **incredibly expensive.**",
        "A **`$0.10`** call to Opus that successfully negotiates a vendor discount is **practically free.**",
      ],
    },
    {
      kind: "p",
      text: "**The Metric:** **Cost per Successful Feature Action.** Track the total LLM spend of a feature divided by the number of successful, un-reverted user actions. If your AI chat feature costs **`$500/month`** but only resolves **`10`** tickets, your Cost Per Action is **`$50`**. You are better off hiring a human.",
    },
    {
      kind: "h2",
      text: "The FinOps Readiness Checklist",
    },
    {
      kind: "ol",
      items: [
        "**Hard Max Tokens:** Never leave `max_tokens` unbound. If you only need a JSON boolean, set `max_tokens: 50`. Do not let the model ramble for `$2.00`.",
        "**Circuit Breakers:** Implement a Redis-backed token bucket rate limiter. If a specific `tenant_id` exceeds `$10` in an hour, fallback to a cached response or an error state.",
        "**Model Abstraction:** Never hardcode model strings (for example `gpt-4o`) in your business logic. Use internal aliases (`ModelTier.REASONING`) so you can hot-swap providers via environment variables when pricing wars occur.",
      ],
    },
  ],
};
