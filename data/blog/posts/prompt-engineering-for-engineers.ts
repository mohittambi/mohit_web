import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "prompt-engineering-for-engineers",
  title: "Prompt Engineering for Engineers: Schemas, Few-Shot Layouts, and Regression Tests",
  description:
    "Treat prompts like APIs: contracts, examples, and tests so LLM behaviour stays stable across model upgrades.",
  publishedAt: "2026-04-14",
  readTime: "10 min read",
  difficulty: "Intermediate",
  tags: ["LLM", "Prompting", "Quality", "DX", "AWS Bedrock"],
  sections: [
    {
      kind: "p",
      text: "Informal prompts live in Slack and die in regressions. Engineering-grade prompting means structured system instructions, explicit output schemas, and a corpus of evaluation prompts that run in CI or nightly jobs.",
    },
    {
      kind: "h2",
      text: "AWS Bedrock: model-agnostic vs model-specific prompts",
    },
    {
      kind: "p",
      text: "When you standardise on **AWS Bedrock**, you still swap foundation models behind one API -- but **prompt packaging is not portable** if you pretend every model reads the same system block the same way. **Model-agnostic** layers are your contracts: JSON schema, tool definitions, task rubrics, eval cases, and **canonical** user content (no vendor-specific markup in the business payload you persist). **Model-specific** adapters sit at the edge: for **Anthropic Claude**, structure system vs user with clear delimiters and lean on message roles and **XML-style section tags** (for example wrapping instructions vs retrieved context) the model family was tuned on; for **Meta Llama** and similar on Bedrock, you typically lean on explicit **instruction / system headers**, different template ordering, and **stop-sequence** behaviour that does not match Claude's tag grammar. Keep adapters in small modules per model family so CI can run the same golden tests through each adapter and fail when a vendor tweak breaks one encoding path.",
    },
    {
      kind: "prompt_example",
      title: "Claude vs Llama adapter -- same task spec, different packaging",
      before: {
        label: "Naive (no adapter)",
        language: "javascript",
        code: `// Bad: Claude-specific XML baked into your DB
const stored = {
  userMessage: "<context>{{retrieved_chunks}}</context>\\nAnswer: {{question}}"
};
// Breaks completely when you swap to Llama 3 on Bedrock`,
      },
      after: {
        label: "Adapter pattern",
        language: "javascript",
        code: `// Neutral task spec stored in DB
const taskSpec = { question, retrievedChunks };

// Claude adapter (invoked at call time)
function toClaudePrompt(spec) {
  return {
    system: "You are a helpful assistant. Answer from the provided context only.",
    messages: [{
      role: "user",
      content: \`<context>\\n\${spec.retrievedChunks.join("\\n")}\\n</context>\\n\\n\${spec.question}\`
    }]
  };
}

// Llama 3 adapter (same spec, different packaging)
function toLlamaPrompt(spec) {
  return \`<|begin_of_text|><|start_header_id|>system<|end_header_id|>
Answer only from the context below.<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Context: \${spec.retrievedChunks.join(" ")}
Question: \${spec.question}<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>\`;
}`,
      },
      note: "The task spec is model-agnostic and persisted. Adapters are thin modules -- your CI golden tests pass the same spec through both.",
    },
    {
      kind: "ul",
      items: [
        "One internal task spec object -- many `toProviderPrompt()` implementations (Claude vs Llama vs Titan).",
        "Never embed Claude-only XML conventions inside data you persist as the user's canonical question -- store neutral text, wrap at invoke time.",
        "Bedrock Converse API where possible; still test raw prompt deltas when a model card changes.",
      ],
    },
    {
      kind: "h2",
      text: "Schemas beat prose for machine consumption",
    },
    {
      kind: "p",
      text: "JSON mode, tool definitions, or constrained grammars reduce parse failures and make downstream code boring. When the model must choose between enums, list the allowed values once and validate server-side anyway -- models drift, validators do not.",
    },
    {
      kind: "prompt_example",
      title: "Unstructured output vs JSON schema -- extracting ticket priority",
      before: {
        label: "Prose instruction (fragile)",
        language: "plaintext",
        code: `System: You are a support triage bot.
User: Classify this ticket and tell me the priority.

Ticket: "Payment gateway down, all checkouts failing since 10am"

// Model might return:
// "This is a P1 critical issue..."
// "Priority: High"
// "I'd classify this as urgent (P0)"
// -> Your regex breaks on all three`,
      },
      after: {
        label: "JSON schema (stable)",
        language: "plaintext",
        code: `System: You are a support triage bot.
Return ONLY valid JSON matching this schema -- no prose, no markdown.

Schema:
{
  "priority": "P0" | "P1" | "P2" | "P3",
  "category": "billing" | "infra" | "auth" | "other",
  "requires_oncall": boolean,
  "one_line_summary": string  // max 80 chars
}

User: Classify this ticket:
"Payment gateway down, all checkouts failing since 10am"

// Model returns (every time):
// { "priority": "P0", "category": "billing",
//   "requires_oncall": true,
//   "one_line_summary": "Payment gateway down, all checkouts failing" }`,
      },
      note: "With Claude on Bedrock, use tool_use or json_mode. With Llama, append the schema and set a stop sequence. Validate server-side regardless -- treat the schema as a contract, not a guarantee.",
    },
    {
      kind: "h2",
      text: "Few-shot layout matters",
    },
    {
      kind: "p",
      text: "Put stable rules first, then diverse examples ordered from simple to edge case. Mirror the token patterns you see in production; synthetic 'perfect' examples teach polish, not robustness. Rotate examples when you discover systematic failure modes.",
    },
    {
      kind: "prompt_example",
      title: "Few-shot ordering -- simple to edge case",
      before: {
        label: "Random order (worse accuracy)",
        language: "plaintext",
        code: `System: Tag each message as REFUND, CANCEL, or QUERY.

Example 1 (edge case first -- confuses model):
User: "I want my money back but keep the subscription"
Tag: REFUND

Example 2:
User: "Stop my plan"
Tag: CANCEL

Example 3:
User: "How do I download invoices?"
Tag: QUERY`,
      },
      after: {
        label: "Simple to edge case (better)",
        language: "plaintext",
        code: `System: Tag each message as REFUND, CANCEL, or QUERY.
Rules:
- REFUND: user wants money returned
- CANCEL: user wants subscription stopped
- QUERY: anything else

Example 1 (canonical -- simple):
User: "I want a refund"
Tag: REFUND

Example 2 (canonical -- simple):
User: "Cancel my account"
Tag: CANCEL

Example 3 (canonical -- simple):
User: "Where are my invoices?"
Tag: QUERY

Example 4 (edge -- ambiguous):
User: "I want my money back but keep the subscription active"
Tag: REFUND

Example 5 (edge -- implicit cancel):
User: "I'm switching to a competitor"
Tag: CANCEL`,
      },
      note: "Canonical examples establish the pattern. Edge cases at the end teach exception handling without disrupting the base distribution the model learns from earlier examples.",
    },
    {
      kind: "h2",
      text: "Regression tests for nondeterminism",
    },
    {
      kind: "p",
      text: "Use temperature-appropriate thresholds: exact match for extraction, semantic similarity or rubric scoring for open generation. Track pass rate over time; a slow decline often precedes a model or data change. Pin model versions for releases; float them in sandboxes.",
    },
    {
      kind: "prompt_example",
      title: "Eval harness -- what a CI prompt regression test looks like",
      after: {
        label: "TypeScript eval runner",
        language: "typescript",
        code: `// eval/triage-classifier.eval.ts
const GOLDEN_CASES = [
  { input: "Payment gateway down",         expected: "P0", category: "billing" },
  { input: "Can't log in with Google SSO", expected: "P1", category: "auth"    },
  { input: "How do I export a CSV?",       expected: "P3", category: "other"   },
  // 47 more cases covering edge inputs...
];

async function runEval() {
  let pass = 0;
  for (const c of GOLDEN_CASES) {
    const result = await classifyTicket(c.input); // calls your prompt
    if (result.priority === c.expected && result.category === c.category) pass++;
  }
  const rate = pass / GOLDEN_CASES.length;
  console.log(\`Pass rate: \${(rate * 100).toFixed(1)}%\`);
  if (rate < 0.92) process.exit(1); // fail CI below 92%
}

// Run nightly and on every prompt change.
// Alert when pass rate drops >3% week-over-week.`,
      },
      note: "Temperature 0 for evals. Track pass rate in a time-series -- a drop from 96% to 91% before a model upgrade gives you advance warning, not a post-deploy incident.",
    },
    {
      kind: "cost_note",
      label: "FinOps note -- few-shot token overhead",
      paragraphs: [
        "A 10-shot example block adds **400-600 tokens** per request. At GPT-4o pricing ($0.005/1k input tokens) and 1M requests/month, that overhead costs **$2,000-3,000/mo extra** vs a well-tuned 0-shot prompt. Few-shot is not free -- it is a trade against fine-tuning or better system-prompt design.",
        "**Fine-tuning break-even**: GPT-4o mini fine-tuning costs ~$3/1M training tokens (one-time) and eliminates example overhead. At 500k req/mo with 500-token example blocks, fine-tuning pays back in **2-3 months** and is cheaper from month 4 onward.",
        "Chain-of-thought prompts inflate output tokens 3-5x. At $0.015/1k output tokens (GPT-4o), a 200-token answer expanding to 800 tokens adds $9/10k requests. Reserve CoT for tasks where the accuracy gain is measured -- classification rarely justifies it.",
      ],
      formula: "monthly_few_shot_overhead = (requests / 1000) * example_tokens * input_price_per_1k_tokens\nfine_tune_break_even_months = training_cost / (overhead_before_mo - overhead_after_mo)",
    },
  ],
};
