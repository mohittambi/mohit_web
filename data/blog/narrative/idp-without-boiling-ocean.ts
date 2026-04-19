import type { NarrativeAppendix } from "../narrative-appendix-types";
import { postTitleBySlug } from "../post-titles";

export const narrativeAppendix: NarrativeAppendix = {
  warStory: {
    context:
      "Composite: ~180 engineers; mandated internal PaaS; Kubernetes everywhere narrative.",
    broke:
      "Time-to-first-deploy for new services ~21 days → ~34 days median after “helpful” centralisation—teams routed around with shadow clusters; senior ICs quietly interviewed out citing YAML-and-ticket fatigue.",
    wrong_first:
      "We published a 47-page standards doc before fixing one golden path—adoption flat; cynicism high.",
    solution:
      "One service template (Node + TS) with CI, canary, OTel, IAM patterns baked in; voluntary migration with public TTFD metrics; rotation from product eng.",
    tradeoff:
      "We accepted long-tail snowflakes living outside the golden path with guardrails, not pretend elimination.",
  },
  whatNot: [
    "I would not measure platform success by feature count—measure TTFD, MTTR, and toil tickets burned down.",
    "I would not staff platform entirely with engineers who have not shipped oncall recently—empathy decays into control.",
  ],
  numbers: [
    "Golden path: first cohort (~12 teams) cut median TTFD from ~21d → ~4d in ~8 weeks—numbers are illustrative composite, not a guarantee.",
    "Policy-as-code checks: ~15–25 high-signal rules beat 100+ noisy linter rules that teams mute.",
  ],
  readNextIntro: "If this problem shows up, read next:",
  readNextItems: [
    { slug: "platform-metrics-slis-slos", title: postTitleBySlug["platform-metrics-slis-slos"], why: "Platform teams need SLOs on the golden path itself." },
    { slug: "opentelemetry-sampling-cost", title: postTitleBySlug["opentelemetry-sampling-cost"], why: "Standard observability is the first paved road I repave." },
    { slug: "lambda-to-ecs-when-serverless-stops", title: postTitleBySlug["lambda-to-ecs-when-serverless-stops"], why: "Compute defaults belong in the golden path, not tribal docs." },
  ],
};
