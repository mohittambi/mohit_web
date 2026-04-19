import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: extraction pipeline to JSON Schema on AWS Bedrock (Claude + Llama families behind one gateway); ~6M rows/month through a summariser step.",
    broke:
      "Silent field drift: pass rate on CI eval dropped from ~94% to ~81% after a vendor model upgrade—no parse errors, just wrong enums.",
    wrong_first:
      "We added more few-shot examples (12 → 28) instead of tightening schema validation and pinning—latency rose ~40% and cost followed.",
    solution:
      "Pinned model for releases, nightly float in staging; server-side validators; **model-agnostic** task specs (schema, rubric, neutral user text) with **model-specific** Bedrock adapters—**Claude** tuned on XML-style section tags and role boundaries; **Llama** families on different message headers, stop tokens, and BOS/EOS habits—smaller few-shot with adversarial negatives; rubric scoring for fuzzy fields.",
    tradeoff:
      "We accepted slower iteration for prompt tweakers—PR + eval gate became non-negotiable for production-bound templates.",
  },
  whatNot: [
    "I would not treat “more examples” as the first knob—it is the laziest and often hides data skew.",
    "I would not ship JSON mode without a hard server parse—models drift; your API contract should not.",
  ],
  numbers: [
    "Eval corpus: below ~300 diverse cases you are mostly measuring noise; past ~2k you start catching slow regressions.",
    "Temperature: for extraction we run 0; for creative drafting 0.6–0.8 with different eval thresholds—mixing them is how CI goes red for the wrong reason.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "rag-without-regret", title: postTitleBySlug["rag-without-regret"], why: "When prompts look fine but answers are wrong, retrieval is often the real culprit." },
    { slug: "llm-api-token-budgets", title: postTitleBySlug["llm-api-token-budgets"], why: "Bigger prompts and rerolls show up in cost dashboards before they show up in retros." },
    { slug: "context-windows-caching-sessions", title: postTitleBySlug["context-windows-caching-sessions"], why: "Long prompts are a retention design, not a storage hack." },
  ],
};
