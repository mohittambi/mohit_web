import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "lambda-to-ecs-when-serverless-stops",
  title: "From Lambda to ECS: When Serverless Stops Being the Right Default",
  description:
    "Cold starts, concurrency ceilings, and VPC complexity push teams toward containers. Here is how to decide -- and how to migrate without heroics.",
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
        "VPC-private workloads where NAT Gateway data-processing cost starts rivalling compute spend.",
      ],
    },
    {
      kind: "h2",
      text: "VPC, connections, and the hidden NAT tax",
    },
    {
      kind: "p",
      text: "Most 'Lambda is cheaper' spreadsheets omit the VPC path. For private subnets with outbound internet, NAT Gateway is often non-optional. The hourly charge (~$0.045/hr per gateway) is predictable -- but the **data-processing charge ($0.045/GB)** is not. For chatty APIs, document pipelines, or supply-chain fan-out, NAT processing can exceed Lambda compute on the same invoice line. Multi-AZ deployments multiply this: three NAT Gateways cost ~$98/month in gateway existence alone before a single byte of traffic.",
    },
    {
      kind: "cost_table",
      title: "NAT Gateway cost -- three-AZ VPC (ap-south-1, 2026)",
      headers: ["Line item", "Rate", "3-AZ monthly (no traffic)"],
      rows: [
        ["NAT Gateway hourly", "$0.045 / hr", "~$97.20 (3 × 720 h)"],
        ["Data processing", "$0.045 / GB", "Billed on top -- 1 TB adds ~$46"],
        ["VPC Interface Endpoint (alt)", "$0.013 / hr per AZ + $0.01/GB", "Cheaper for high-volume AWS API traffic"],
      ],
      note: "Rates are ap-south-1 April 2026. Re-verify on the AWS Pricing Calculator before publishing -- NAT rates drift and vary by commitment.",
    },
    {
      kind: "h2",
      text: "The crossover math: when does ECS win on cost?",
    },
    {
      kind: "p",
      text: "Lambda billing is **invocations x duration x memory** -- a beautiful model for traffic that spikes from zero. The trap is assuming that shape stays cheap at sustained load. For a Node.js API with 1 GB allocated and 200 ms average duration, the GB-seconds stack up fast.",
    },
    {
      kind: "prompt_example",
      title: "Lambda vs Fargate -- worked cost example (ARM, ap-south-1)",
      after: {
        label: "Break-even calculation",
        language: "plaintext",
        code: `-- Lambda at 50 RPS (ARM Graviton, ap-south-1) --
Memory:       1 GB
Duration:     200 ms avg
GB-s/invoke:  1 GB x 0.2 s = 0.2 GB-s
Monthly invocations: 50 x 86,400 x 30 = 129,600,000
Total GB-s:   129,600,000 x 0.2 = 25,920,000
Compute cost: 25,920,000 x $0.00001333 = ~$345/month
(+ request charges ~$1.30/1M, + NAT if VPC)

-- Fargate (0.5 vCPU, 1 GB, ARM, 24x7) --
vCPU-hr rate: $0.03238/hr
RAM-hr rate:  ~$0.00356/GB-hr
Task $/hr:    (0.5 x $0.03238) + (1 x $0.00356) = ~$0.01975
Monthly:      $0.01975 x 720 h = ~$14.22 per task
(+ ALB ~$18/mo fixed, + data transfer)

-- Break-even ("~4 RPS rule", same assumptions) --
Lambda cost approx = RPS x 518,400 x 0.2 x $0.00001333
                   = RPS x ~$1.38/month per RPS
One Fargate task   = ~$26/month (rounded with ALB share)
Break-even RPS     = $26 / $1.38 = ~19 RPS per task

Above ~20 RPS sustained -> Fargate at fixed task-hour cost
Below ~4 RPS            -> Lambda elasticity premium is worth it
4-20 RPS                -> Measure; strangler pattern, shift gradually`,
      },
      note: "Change memory (512 MB vs 1 GB) or duration (50 ms vs 500 ms) and recompute -- the break-even moves significantly. Always state your assumptions in the same paragraph as the number.",
    },
    {
      kind: "h2",
      text: "Observability tax: Lambda vs ECS",
    },
    {
      kind: "p",
      text: "On Lambda, extensions, agents, and sidecars still run inside your billed execution window -- there is a real observability tax in milliseconds and dollars per invocation. On ECS/Fargate, those processes typically share the task's CPU and memory envelope: you plan one bigger container instead of watching PC units stack next to function duration. Neither is free; the question is which billing shape matches your traffic and how honest you are about tail latency when agents wake up under load.",
    },
    {
      kind: "h2",
      text: "What you should not optimise away",
    },
    {
      kind: "p",
      text: "Per-invocation billing and IAM-scoped blast radius are real advantages. If you move to ECS, recreate boundaries with task roles, service quotas, and autoscaling policies that mirror the blast radius you had per function. Cost attribution should move from 'per invocation' to 'per task hour plus data transfer' -- finance needs the same transparency.",
    },
    {
      kind: "h2",
      text: "Migration without drama",
    },
    {
      kind: "p",
      text: "Strangle the path: put a stable API facade in front, shift traffic by route or tenant, and keep rollback to Lambda one configuration change away. Size tasks from measured p99 CPU and memory, not peak marketing slides. Bake health checks and graceful shutdown into the container from day one so deployments are boring.",
    },
    {
      kind: "ul",
      items: [
        "**Rollback trigger:** if p99 latency exceeds SLO or task cost exceeds Lambda projection within 72 hours, flip the weighted routing rule back. Do not wait for an incident.",
        "**Traffic shifting:** ALB weighted target groups or API Gateway stage variables let you move 5% -> 25% -> 100% without a deployment.",
        "**Cost checkpoint:** after 7 days on ECS, pull the Cost Explorer 'service' dimension and compare against the Lambda baseline week. Surprises surface here, not in spreadsheets.",
      ],
    },
    {
      kind: "cost_table",
      title: "Lambda vs Fargate -- RPS crossover (ARM, ap-south-1, 1 GB / 200 ms)",
      headers: ["RPS (sustained)", "Lambda /mo", "1x Fargate task /mo", "Verdict"],
      rows: [
        ["1 RPS", "~$7", "~$26", "Lambda wins"],
        ["5 RPS", "~$35", "~$26", "Fargate pulls ahead"],
        ["20 RPS", "~$138", "~$26", "Fargate ~5x cheaper"],
        ["50 RPS", "~$345", "~$44 (2 tasks)", "Fargate ~8x cheaper"],
        ["200 RPS", "~$1,382", "~$100 (4 tasks)", "Fargate ~14x cheaper"],
      ],
      note: "Task count scaled to maintain headroom. Excludes ALB (~$18/mo), NAT, CloudWatch, and request charges. ARM Graviton throughout. Compute Savings Plans typically add another 20-30% off the Fargate side once commitments are stable.",
    },
    {
      kind: "region_note",
      region: "ap-south-1 (Mumbai)",
      paragraphs: [
        "Mumbai Fargate ARM rates (~$0.03238/vCPU-hr) are **~12% higher** than us-east-1 equivalents. Lambda ARM rates are similarly offset. The crossover RPS threshold is roughly the same because both sides scale proportionally -- but the absolute dollar savings from migrating are smaller, making the decision more sensitive to traffic shape.",
        "NAT Gateway data processing in ap-south-1 is **$0.045/GB** -- identical to us-east-1. High-bandwidth workloads (supply-chain document pipelines, ML inference with large payloads) should model NAT cost explicitly; it often becomes the **dominant line item** in VPC-private Lambda deployments above ~500 GB/month outbound.",
        "Graviton (ARM) should be your default for both Lambda and Fargate in this region. x86 rates are ~20-25% higher for equivalent compute, and most Node.js, Python, and Go workloads run without code changes on ARM.",
      ],
    },
  ],
};
