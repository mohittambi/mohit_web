import type { CareerArtifacts } from "../career-artifacts-types";
import { blogPostUrl } from "../site";

export const careerArtifacts: CareerArtifacts = {
  opinionHook:
    "Principal-level truth: provisioned concurrency and NAT-shaped VPC paths can turn your Lambda bill into a luxury car lease while p99 still misses the SLO -- ECS is sometimes the cheaper honesty.",
  strongVisual:
    "2:00 AM alert tile + invoice spike next to dual histogram: Lambda p99 vs Fargate p99; third strip: extension/sidecar ms billed on Lambda vs shared task CPU on ECS.",
  linkedInThread: [
    "2:00 AM page: PC could not absorb the spike, p99 blew out, finance asked why 'serverless' read like a luxury car lease on the invoice.",
    "Cold starts + VPC ENI paths are where p99 goes to die -- graph them before the architecture debate.",
    "Observability tax: on Lambda, extensions and agents bill inside the invocation envelope; on ECS they share the task CPU/RAM envelope -- different accounting, still real capacity.",
    "Provisioned concurrency is useful and easy to over-prescribe -- half your hot path on PC is a smell.",
    "Strangler I repeat: stable API façade, partial traffic shift, rollback to Lambda in one config change.",
    "Size Fargate from measured CPU/RAM and connection churn -- not slide t-shirt sizes.",
    "AWS Lambda quotas & scaling: https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html  --  know your account ceilings before launch week.",
    `${blogPostUrl("lambda-to-ecs-when-serverless-stops")}  --  when serverless stops being the default (cost, tail, sidecars).`,
    "What signal -- not slogan -- made your team move hot paths to containers?",
  ],
  diagramBrief: {
    title: "Lambda → ECS strangler",
    elements: [
      "ALB split traffic % arrow; rollback arrow back to Lambda stack in one hop.",
      "Burst RPS arrow into Lambda throttle icon; parallel path into ECS service steady line.",
      "VPC: ENI / cold path marked as bottleneck; retry spiral on client if backoff missing.",
      "Observability tax panel: Lambda box with meter 'extension ms × invocations'; ECS task box with shared CPU for app + agent -- label marginal surprise.",
    ],
  },
  ctoFromScratch: {
    week1: [
      "Measure p50/p99 CPU, memory, connection count, cold start rate on hot routes.",
      "Spike test reserved concurrency contention; document account-wide limits.",
      "Decision memo: one page with rollback criteria and owner sign-off.",
    ],
    month1: [
      "Stand up golden path service on Fargate behind same ALB; dual-run metrics.",
      "Autoscaling policies with bounded scale-out; alarms on task placement failures.",
      "Runbooks: deploy, rollback, credential rotation parity with Lambda world.",
    ],
    scale: [
      "Cell-based or shard-based isolation for noisy neighbours if multi-tenant.",
      "Progressive region expansion with replicated control plane patterns.",
      "Cost showback: task-hours + data transfer vs old invocation model.",
    ],
  },
  interview30Sec:
    "I stay on Lambda until tails, connection shape, or observability sidecars break the SLO or the bill. I model observability tax explicitly, then migrate with a strangler and one-click rollback. I size Fargate from measured CPU/RAM, not slogans.",
  cto1Min:
    "Week one I graph p99, PC spend, and extension overhead next to a finance-friendly unit cost. Month one I dual-run Fargate behind the same façade with rollback tested from prod. Scale phase is noisy-neighbour isolation, multi-region posture, and showing task-hour economics next to the old invocation model -- so leadership sees cost and complexity as one decision.",
};
