import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook: "Nine nines on the load balancer mean nothing if customers live in your p99 tail.",
  strongVisual:
    "Two charts: vanity uptime flat vs user-journey latency tail shrinking after SLI fix.",
  linkedInThread: [
    "SLIs should survive a whiteboard with product—LB-only success bits are not a user journey.",
    "Exclude bots or bad traffic with a written policy or you are optimising charts, not customers.",
    "Error budgets are the currency between velocity and stability—publish how spend maps to launches.",
    "Google SRE — alerting on SLOs (multi-window burn): https://sre.google/sre-book/alerting-on-slos/",
    `${blogPostUrl("platform-metrics-slis-slos")} — SLIs, SLOs, error budgets leadership can trust.`,
    "What SLI made your execs stop rolling their eyes?",
  ],
  diagramBrief: {
    title: "User journey with SLI tap points",
    elements: [
      "Client → edge → app → DB with tap icons; red on LB-only measurement gap.",
      "Error budget gauge feeding feature freeze / debt paydown decision diamonds.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Draft SLI definitions in git; one user journey mapped end-to-end.",
      "Instrument edge + app p99; stop reporting only LB success bit.",
      "Pick initial SLO targets with explicit error budget policy draft.",
    ],
    month1: [
      "Burn rate alerts; incident retro links to SLI changes.",
      "Product roadmap gates tied to budget health.",
      "Bot exclusion policy written and versioned.",
    ],
    scale: [
      "Tiered SLOs per customer segment where contracts differ.",
      "Synthetic + RUM combined with known blind spots documented.",
      "Executive dashboard with three numbers max—discipline.",
    ],
  },
  interview30Sec:
    "I define SLIs from user journeys, not load balancers, put definitions in version control, and tie error budgets to launch and debt decisions. If the budget does not move when customers complain, the SLI is wrong—not the customers.",
  cto1Min:
    "Week one I map one critical journey and instrument p99 and success at the edge. Month one I add burn alerts and connect budget policy to roadmap gates. At scale I tier SLOs by customer segment and ruthlessly limit executive dashboards to a few trusted numbers so the org optimises reality, not charts.",
};
