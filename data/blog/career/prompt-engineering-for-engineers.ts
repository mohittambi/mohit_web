import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook: "More few-shot examples are the laziest knob—they often hide data skew until the model upgrade hits.",
  strongVisual:
    "CI graph: eval pass rate cliff after model version bump; second line after schema validation + pin.",
  linkedInThread: [
    "On AWS Bedrock you still swap models behind one API—keep task specs model-agnostic, put Claude vs Llama prompt packaging in small adapters.",
    "Prompts are interfaces: JSON schema + server-side parse beats “JSON mode” optimism after a vendor upgrade.",
    "Eval gates need enough volume to be signal; pin models in prod, float in staging, track pass rate like an API SLO.",
    "Anthropic prompt engineering overview (message structure): https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
    `${blogPostUrl("prompt-engineering-for-engineers")} — schemas, few-shot layout, regression tests, Bedrock split.`,
    "What broke your prompts after a model version bump?",
  ],
  diagramBrief: {
    title: "Prompt + eval CI gate",
    elements: [
      "PR arrow into eval harness; fail path blocks merge.",
      "Model pin box vs staging float channel dashed.",
      "Schema validator with X on invalid JSON escaping to user.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Schema + server validation for all structured outputs.",
      "Golden eval set in CI; pin model for prod releases.",
      "Document temperature policy per task class.",
    ],
    month1: [
      "Rubric for fuzzy outputs; drift dashboard on pass rate.",
      "Rotate few-shot with review; adversarial negatives added from incidents.",
      "Canary prompts with automatic rollback hooks.",
    ],
    scale: [
      "Multi-region eval runners; artifact retention policy.",
      "Governance for who approves prompt changes in regulated flows.",
      "Cost/latency budget per prompt class tied to product metrics.",
    ],
  },
  interview30Sec:
    "I version prompts like APIs: schemas validated server-side, model pins in production, and eval gates in CI. I increase few-shot diversity deliberately, not volume, and I separate extraction from creative tasks in testing.",
  cto1Min:
    "Week one I enforce structure and validation. Month one I add rubrics, drift dashboards, and adversarial examples from incidents. At scale I run multi-region eval infrastructure with governance on who can ship prompt changes when outcomes are regulated or revenue-critical.",
};
