import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "lambda-to-ecs-when-serverless-stops",
  title: "From Lambda to ECS: When Serverless Stops Being the Right Default",
  description:
    "Cold starts, concurrency ceilings, and VPC complexity push teams toward containers. Here is how to decide—and how to migrate without heroics.",
  publishedAt: "2026-04-17",
  readTime: "10 min read",
  difficulty: "Deep dive",
  tags: ["AWS", "Lambda", "ECS", "Architecture"],
  sections: [
    {
      kind: "p",
      text: "Lambda remains the fastest path from idea to HTTPS for many workloads. It stops being the default when tail latency, reserved concurrency fights, or package size and native dependency pain dominate your incident history. Moving to ECS Fargate is often a packaging and traffic-shape decision more than a philosophical one.",
    },
    {
      kind: "h2",
      text: "Signals that point at containers",
    },
    {
      kind: "ul",
      items: [
        "Sustained high CPU or memory with bursty cold-start spikes you cannot provision away.",
        "Long-lived connections, streaming, or background workers that fight the Lambda execution model.",
        "Need for predictable network paths, sidecars, or observability agents that do not fit the zip bundle model.",
      ],
    },
    {
      kind: "h2",
      text: "Observability tax: Lambda vs ECS",
    },
    {
      kind: "p",
      text: "On Lambda, extensions, agents, and sidecars still run inside your billed execution window—there is a real observability tax in milliseconds and dollars per invocation. On ECS/Fargate, those processes typically share the task’s CPU and memory envelope: you plan one bigger container instead of watching PC units stack next to function duration. Neither is free; the question is which billing shape matches your traffic and how honest you are about tail latency when agents wake up under load.",
    },
    {
      kind: "h2",
      text: "What you should not optimise away",
    },
    {
      kind: "p",
      text: "Per-invocation billing and IAM-scoped blast radius are real advantages. If you move to ECS, recreate boundaries with task roles, service quotas, and autoscaling policies that mirror the blast radius you had per function. Cost attribution should move from “per invocation” to “per task hour plus data transfer”—finance needs the same transparency.",
    },
    {
      kind: "h2",
      text: "Migration without drama",
    },
    {
      kind: "p",
      text: "Strangle the path: put a stable API in front, shift traffic by route or tenant, and keep rollback to Lambda one configuration change away. Size tasks from measured p99 CPU and memory, not peak marketing slides. Bake health checks and graceful shutdown into the container from day one so deployments are boring.",
    },
  ],
};
