import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "prompt-engineering-for-engineers",
  title: "Prompt Engineering for Engineers: Schemas, Few-Shot Layouts, and Regression Tests",
  description:
    "Treat prompts like APIs: contracts, examples, and tests so LLM behaviour stays stable across model upgrades.",
  publishedAt: "2026-04-14",
  readTime: "10 min read",
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
      text: "When you standardise on **AWS Bedrock**, you still swap foundation models behind one API—but **prompt packaging is not portable** if you pretend every model reads the same system block the same way. **Model-agnostic** layers are your contracts: JSON schema, tool definitions, task rubrics, eval cases, and **canonical** user content (no vendor-specific markup in the business payload you persist). **Model-specific** adapters sit at the edge: for **Anthropic Claude**, structure system vs user with clear delimiters and lean on message roles and **XML-style section tags** (for example wrapping instructions vs retrieved context) the model family was tuned on; for **Meta Llama** and similar on Bedrock, you typically lean on explicit **instruction / system headers**, different template ordering, and **stop-sequence** behaviour that does not match Claude’s tag grammar. Keep adapters in small modules per model family so CI can run the same golden tests through each adapter and fail when a vendor tweak breaks one encoding path.",
    },
    {
      kind: "ul",
      items: [
        "One internal “task spec” object → many `toProviderPrompt()` implementations (Claude vs Llama vs Titan).",
        "Never embed Claude-only XML conventions inside data you persist as the user’s canonical question—store neutral text, wrap at invoke time.",
        "Bedrock Converse API where possible; still test raw prompt deltas when a model card changes.",
      ],
    },
    {
      kind: "h2",
      text: "Schemas beat prose for machine consumption",
    },
    {
      kind: "p",
      text: "JSON mode, tool definitions, or constrained grammars reduce parse failures and make downstream code boring. When the model must choose between enums, list the allowed values once and validate server-side anyway—models drift, validators do not.",
    },
    {
      kind: "h2",
      text: "Few-shot layout matters",
    },
    {
      kind: "p",
      text: "Put stable rules first, then diverse examples ordered from simple to edge case. Mirror the token patterns you see in production; synthetic “perfect” examples teach polish, not robustness. Rotate examples when you discover systematic failure modes.",
    },
    {
      kind: "h2",
      text: "Regression tests for nondeterminism",
    },
    {
      kind: "p",
      text: "Use temperature-appropriate thresholds: exact match for extraction, semantic similarity or rubric scoring for open generation. Track pass rate over time; a slow decline often precedes a model or data change. Pin model versions for releases; float them in sandboxes.",
    },
  ],
};
