import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook: "Choreography looks simple on slides; orchestration buys debuggability when money is in flight.",
  strongVisual:
    "State machine with red timeout edge to compensation; human swim-lane for break-glass.",
  linkedInThread: [
    "Distributed sagas live in partial failure: if you cannot name stuck states, you cannot operate money paths.",
    "Compensations must be idempotent—retries will run them twice.",
    "Timeouts are state transitions with owners; “verify” RPCs between every step buy latency, not safety, if idempotency is wrong.",
    "Saga pattern (choreography vs orchestration primer): https://microservices.io/patterns/data/saga.html",
    `${blogPostUrl("event-driven-sagas-recovery")} — orchestration vs choreography, compensation, human break-glass.`,
    "Orchestration vs choreography—which hurt you more in prod?",
  ],
  diagramBrief: {
    title: "Saga with timeout + compensation",
    elements: [
      "Happy path solid arrows; payment wait state with clock; timeout arrow to compensate.",
      "Compensation path dashed with idempotent stamp; wrong path X if order not enforced.",
      "Human break-glass box with audit log arrow—only role with privilege.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Explicit saga state enum + persistence; correlation id everywhere.",
      "Deadline per state; alert on breach before customer SLA.",
      "Idempotent compensator tests with duplicate delivery simulation.",
    ],
    month1: [
      "HA orchestrator or hardened choreography with traceable aggregate progress.",
      "Runbooks for stuck saga triage; metrics on age distribution.",
      "Post-incident template ties timeout policy changes to error budget.",
    ],
    scale: [
      "Sharding saga instances by tenant; backpressure on start rate.",
      "Bulk compensation tooling for rare platform faults.",
      "Cross-region saga policy—where truth lives during partition.",
    ],
  },
  interview30Sec:
    "I persist saga state, treat timeouts as transitions, and make compensations idempotent. I add human break-glass with audit when reversals are irreversible. I pick orchestration when debuggability beats purity.",
  cto1Min:
    "Week one I make partial failure visible with deadlines and correlation. Month one I invest in orchestrator HA or disciplined choreography with aggregate tracing. At scale I shard saga throughput, ship bulk recovery tools, and align cross-region consistency with how much distributed truth the business can afford.",
};
