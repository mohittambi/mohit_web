import type { BlogPost } from "../types";

const MERMAID_MIGRATION = `graph TD
    Client((Client)) --> API_Gateway[API Gateway HTTP API]

    API_Gateway -- "95% Traffic" --> Lambda[Legacy Lambda Function]
    API_Gateway -- "5% Traffic" --> ALB[Application Load Balancer]

    ALB --> ECS[ECS Fargate Cluster]

    Lambda --> DDB[(DynamoDB)]
    ECS --> DDB`;

const FARGATE_CAPACITY_FORMULA = `Tasks Needed = ceil( (Peak RPS × Average Latency in seconds) / Concurrency Per Task ) × Buffer Multiplier`;

export const post: BlogPost = {
  slug: "lambda-to-ecs-when-serverless-stops",
  title: "From Lambda to ECS: When Serverless Stops Being the Right Default",
  description:
    "The 4 RPS crossover in ap-south-1, VPC cold-start debt vs connection pooling, and the API Gateway weighted rollout we used at A23 to reach ECS with zero downtime.",
  publishedAt: "2026-04-17",
  readTime: "10 min read",
  difficulty: "Deep dive",
  tags: ["AWS", "Lambda", "ECS", "Architecture", "FinOps", "Performance"],
  sections: [
    {
      kind: "p",
      text: "Serverless is an incredible paradigm to start a project. It is also an incredibly expensive paradigm if you succeed.",
    },
    {
      kind: "p",
      text: "At Head Digital Works (A23), we reached a point where our high-throughput wallet reconciliation endpoints were processing **1,240 requests per second**. At that volume, the \"infinite scale\" of AWS Lambda stopped being a feature and became a structural constraint.",
    },
    {
      kind: "p",
      text: "We were hitting concurrency ceilings, experiencing VPC cold-start latency spikes that broke our SLAs, and our monthly AWS bill for compute alone was crossing `$5,400`.",
    },
    {
      kind: "p",
      text: 'The industry narrative is that moving away from Lambda is "going backward." The engineering reality is that when you cross a specific threshold—what I call the **"4 RPS Rule"**—migrating to Amazon ECS (Fargate) is the only responsible architectural decision.',
    },
    {
      kind: "p",
      text: "Here is the math, the migration blueprint, and the sizing formulas required to execute a zero-downtime shift from Lambda to containers.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: '1. The "4 RPS Rule" (The Economic Crossover)',
    },
    {
      kind: "p",
      text: "AWS pricing is a tax on idle time. Lambda charges you a premium so you don't pay for idle. But what happens when your service is **never** idle?",
    },
    {
      kind: "p",
      text: "Let's look at the **2026** unit economics in `ap-south-1` (Mumbai). Assume a Node.js API endpoint that takes `200ms` to execute and requires `1GB` of RAM.",
    },
    {
      kind: "p",
      text: "**Lambda Costs:**",
    },
    {
      kind: "ul",
      items: [
        "Compute: `$0.0000166667` per GB-second.",
        "Requests: `$0.20` per 1 Million requests.",
        "Cost for 1 request (200ms) = `~$0.0000033`",
      ],
    },
    {
      kind: "p",
      text: "**ECS Fargate Costs (On-Demand):**",
    },
    {
      kind: "ul",
      items: [
        "Compute: `$0.04048` per vCPU-hour.",
        "Memory: `$0.004445` per GB-hour.",
        "A `0.25 vCPU / 1GB` Fargate task costs `~$0.014` per hour.",
      ],
    },
    {
      kind: "p",
      text: "If that Fargate task serves just **4 Requests Per Second (RPS)** consistently across an hour, it processes `14,400` requests. The Lambda equivalent for those `14,400` requests costs `$0.047`. The Fargate task costs `$0.014`.",
    },
    {
      kind: "system_alert",
      label: "Principal's Note: The Density Advantage",
      text: "Lambda forces a 1:1 concurrency model. One request equals one execution environment. **Node.js** is fundamentally designed to handle asynchronous I/O concurrently. By moving to ECS, a single Fargate task can handle **50-100** concurrent requests. You aren't just buying cheaper compute; you are unlocking Node's event loop.",
    },
    {
      kind: "p",
      text: "If your service sustains more than **4 RPS** 24/7, you are bleeding margin.",
    },
    {
      kind: "h2",
      text: "2. The Architectural Debt of Cold Starts",
    },
    {
      kind: "p",
      text: "Cost is only half the equation. The other half is latency predictability.",
    },
    {
      kind: "p",
      text: "Cold starts aren't just a latency problem—they are an architectural constraint that shapes every downstream design decision. When a Lambda function scales out rapidly, it has to bootstrap the runtime, attach an ENI (Elastic Network Interface) if inside a VPC, and establish new TCP connections to your database.",
    },
    {
      kind: "p",
      text: "If you use DynamoDB or RDS, a burst of **500** new Lambda concurrent executions means **500** new TCP handshakes hitting your database simultaneously. This leads to connection exhaustion and throttle storms.",
    },
    {
      kind: "p",
      text: "Containers solve this. By pooling connections at the container level (e.g., using `pg-pool` or the AWS SDK's `keepAlive` configuration) across **100** concurrent requests, you protect your downstream infrastructure.",
    },
    { kind: "architecture_toggle", variant: "lambda_ecs" },
    {
      kind: "h2",
      text: "3. The Zero-Downtime Migration Blueprint",
    },
    {
      kind: "p",
      text: "You cannot swap compute engines by flipping a DNS switch. A migration is only zero-downtime if rollback is one command, not one incident.",
    },
    {
      kind: "p",
      text: "To execute this safely, we used **API Gateway V2 (HTTP API)** to perform weighted routing at the ingress layer.",
    },
    { kind: "mermaid", code: MERMAID_MIGRATION },
    {
      kind: "p",
      text: "**The Rollout Strategy:**",
    },
    {
      kind: "ol",
      items: [
        "**Deploy ECS in parallel:** Run your exact Express/Fastify code inside a Docker container on Fargate. Do not change business logic.",
        "**Configure the ALB:** Attach the ECS tasks to a Target Group behind an internal ALB.",
        "**Weight the Route:** Use Terraform to point your existing API Gateway route to a VPC Link connected to the ALB, weighting it at `5%`.",
        "**Monitor Error Budgets:** Watch the p95 latency and 5xx error rates for **24 hours**.",
        "**Dial the Knob:** Shift to `25%`, `50%`, `100%`. If anything breaks, you revert the weight back to Lambda instantly.",
      ],
    },
    {
      kind: "h2",
      text: "4. The Capacity Planning Math",
    },
    {
      kind: "p",
      text: "The most dangerous part of moving to containers is under-provisioning. Lambda scaled for you automatically; now, you must define the ceiling.",
    },
    {
      kind: "p",
      text: "To calculate how many Fargate tasks you need to survive peak load, use the Task Sizing Formula:",
    },
    {
      kind: "code_block",
      language: "text",
      title: "Fargate Capacity Formula",
      code: FARGATE_CAPACITY_FORMULA,
    },
    {
      kind: "p",
      text: "**Example Scenario:**",
    },
    {
      kind: "ul",
      items: [
        "**Peak RPS:** `2,000`",
        "**Avg Latency:** `0.2` seconds (200ms)",
        "**Node.js Concurrency per Task:** `50` (derived from load testing your specific workload)",
        "**Buffer:** `1.5` (To handle sudden bursts before auto-scaling kicks in)",
      ],
    },
    {
      kind: "p",
      text: "**Calculation:** `ceil( (2,000 × 0.2) / 50 ) = 8` tasks base limit. `8 × 1.5 = 12` tasks total.",
    },
    {
      kind: "p",
      text: "You set your ECS Auto-Scaling minimum to **4**, your maximum to **12**, and trigger scale-out based on CPU utilization crossing `60%`.",
    },
    {
      kind: "h2",
      text: "5. When to Stay Serverless",
    },
    {
      kind: "p",
      text: "This is not an anti-Lambda manifesto. Lambda remains the undisputed king for:",
    },
    {
      kind: "ul",
      items: [
        "**Asynchronous Event Processing:** SQS queue consumers, EventBridge targets, S3 object processing.",
        "**Cron Jobs:** Scheduled tasks where idle time is **99%**.",
        "**Unpredictable Traffic:** Services that see **0** requests for hours, then spike to **5,000** RPS in seconds.",
      ],
    },
    {
      kind: "p",
      text: "But for your core, user-facing, synchronous REST or GraphQL APIs with steady baseline traffic? Containers win on cost, tail latency, and connection efficiency every single time.",
    },
    {
      kind: "h2",
      text: "The Migration Checklist",
    },
    {
      kind: "ol",
      items: [
        "**Statelessness:** Ensure your Node.js code doesn't rely on `/tmp` disk state that Lambda provided.",
        "**Health Checks:** Build a robust `/health` endpoint for the ALB. Lambda didn't need one; ECS will relentlessly terminate tasks that fail health checks.",
        "**Graceful Shutdown:** Implement `SIGTERM` handlers to drain active HTTP requests before the container dies during a scale-in event.",
      ],
    },
  ],
};
