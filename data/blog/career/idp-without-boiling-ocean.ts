import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook: "A 47-page standards doc before a golden path is how platform teams lose the room.",
  strongVisual:
    "TTFD median line dropping when one template ships vs flat line during doc-only mandate.",
  linkedInThread: [
    "An IDP is DevEx infrastructure: if strong ICs leave over YAML-and-ticket glue, the portal was theatre.",
    "One golden path with public TTFD beats a 47-page standards PDF nobody adopts.",
    "Policy-as-code + visible exception workflow beats wiki police; showback keeps platform honest.",
    "CNCF platform engineering maturity model (conversation starter with leadership): https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/",
    `${blogPostUrl("idp-without-boiling-ocean")} — golden paths, metrics, sequencing without boiling the ocean.`,
    "What was the smallest golden path that actually shipped for your org?",
  ],
  diagramBrief: {
    title: "Golden path vs long tail",
    elements: [
      "Wide paved road for template stack; rocky side path for exceptions with guardrail icons.",
      "Metrics strip: TTFD, MTTR, toil tickets burned.",
      "Anti-pattern: doc stack height vs flat adoption line crossed out.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Pick one language/framework template with CI, deploy, OTel, IAM baked in.",
      "Public TTFD baseline for teams not yet on path.",
      "Office hours with two pilot teams—no mandate.",
    ],
    month1: [
      "Self-service with policy checks; exception workflow in ticketing.",
      "Showback for platform infra cost per team.",
      "Second template only after first hits adoption threshold.",
    ],
    scale: [
      "Rotation program platform ↔ product six weeks each way.",
      "Cell-based isolation for noisy platform components.",
      "Quarterly pruning of low-usage features with cost cited.",
    ],
  },
  interview30Sec:
    "I grow an IDP from one golden path with measured time-to-first-deploy and MTTR, not from mandates. I use policy-as-code, visible exceptions, and showback so the platform team stays accountable. I rotate product engineers through platform to keep empathy high.",
  cto1Min:
    "Week one I ship one template and measure TTFD for pilot teams. Month one I add guardrails and exception flow with finance-visible showback. At scale I rotate staff, isolate noisy components, and kill platform features that do not move flow metrics—treating internal platforms like products with churn risk.",
};
