export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  problem: string;
  constraints: string[];
  solution: string;
  tech: string[];
  outcomes: string[];
  accentColor: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "lambda-to-ecs",
    title: "Serverless → Container Migration",
    category: "Platform Architecture",
    problem:
      "A high-throughput platform was hitting cold-start latency spikes, concurrency throttling under traffic bursts, and escalating costs on always-on workloads  --  all constraints baked into the serverless model.",
    constraints: [
      "Zero-downtime migration with no client-side changes",
      "Real-time WebSocket connections requiring persistent state",
      "Cost must improve, not worsen, under steady load",
      "Gradual rollout with instant rollback capability",
    ],
    solution:
      "Phased migration using API Gateway V2 HTTP routing to shift traffic gradually across Lambda and ECS Fargate targets. Introduced LRU in-memory caching with TTL eviction, Redis pub/sub for real-time invalidation, and Node.js clustering. Built a multi-stage CI/CD pipeline (GitHub Actions → ECR → ECS) with blue-green deployments and predictive CloudWatch-based auto-scaling.",
    tech: [
      "Amazon ECS Fargate",
      "API Gateway V2",
      "Node.js (clustering)",
      "Redis pub/sub",
      "GitHub Actions",
      "AWS X-Ray",
      "OpenTelemetry",
      "Grafana",
    ],
    outcomes: [
      "~40% reduction in infrastructure cost on steady workloads",
      "35% improvement in p95 latency",
      "60ms reduction in median response time",
      "2.3× throughput under peak load",
      "Eliminated cold-start delays entirely",
      "Zero-downtime migration with no client changes required",
    ],
    accentColor: "#6366f1",
  },
  {
    id: "wallet-reconciliation",
    title: "Financial Reconciliation Engine",
    category: "Reliability Engineering",
    problem:
      "Wallet transactions processed across distributed services created consistency gaps during network failures, retries, and partial commits  --  leading to balance drift that compounded over time.",
    constraints: [
      "Exact-once processing guarantee across distributed services",
      "Sub-second reconciliation for real-time balance accuracy",
      "Replay capability for auditing without data loss",
      "Compliance-grade audit trail",
    ],
    solution:
      "Designed an idempotent event-sourced reconciliation engine using transactional outbox pattern with SQS FIFO queues. Each transaction carried a deterministic event ID; consumers deduped at the processor boundary. State projections enabled point-in-time balance reconstruction for audits.",
    tech: [
      "SQS FIFO",
      "DynamoDB (conditional writes)",
      "Event Sourcing",
      "Transactional Outbox",
      "Node.js",
      "TypeScript",
      "PostgreSQL",
    ],
    outcomes: [
      "Zero balance drift across distributed transaction boundaries",
      "Full audit replay at any point in history",
      "Idempotent processing eliminating duplicate charge risk",
      "Reduced incident response time by 60% with event replay tooling",
    ],
    accentColor: "#10b981",
  },
  {
    id: "event-driven-pipeline",
    title: "High-Throughput Event Pipeline",
    category: "Distributed Systems",
    problem:
      "A tightly-coupled synchronous pipeline collapsed under traffic spikes, cascading failures downstream. Any upstream slowdown caused end-to-end latency blowup and data loss during outages.",
    constraints: [
      "Handle 10× traffic spikes without pre-scaling",
      "Guarantee delivery even during partial service outages",
      "Fan-out to multiple consumers with independent SLAs",
      "Observability into lag and consumer health",
    ],
    solution:
      "Decoupled the pipeline using SNS-SQS fan-out with dead-letter queues and exponential backoff retries. Each consumer scaled independently. Introduced a lightweight event schema registry and a shared observability layer with CloudWatch and custom dashboards for per-consumer lag monitoring.",
    tech: [
      "AWS SNS",
      "AWS SQS",
      "Dead Letter Queues",
      "CloudWatch",
      "Node.js",
      "TypeScript",
      "OpenTelemetry",
      "Grafana",
    ],
    outcomes: [
      "Sustained 10× spike traffic with zero data loss",
      "Pipeline uptime improved to 99.97%",
      "Downstream consumer failures isolated  --  no cascading impact",
      "Mean time to detect pipeline issues dropped by 70%",
    ],
    accentColor: "#f59e0b",
  },
  {
    id: "config-platform",
    title: "Dynamic Configuration Platform",
    category: "Developer Platform",
    problem:
      "Feature flags and config changes required full deployments. A/B tests and business rule updates were bottlenecked by engineering release cycles, slowing product iteration velocity.",
    constraints: [
      "Config changes must propagate in under 5 seconds",
      "No service restarts or redeployments",
      "Audit trail for every config change with rollback",
      "Fine-grained targeting (by user segment, environment, region)",
    ],
    solution:
      "Built a centralized config service with a push-based invalidation model. Services subscribed via long-poll with local fallback caching. Changes published through an admin API with versioned snapshots stored in DynamoDB. Full audit log with per-change diff and one-click rollback.",
    tech: [
      "Node.js",
      "DynamoDB",
      "Redis (pub/sub)",
      "TypeScript",
      "AWS Lambda",
      "API Gateway",
    ],
    outcomes: [
      "Config propagation in <3 seconds across all services",
      "Product team autonomy: zero-engineering config changes",
      "A/B test deployment time reduced from days to minutes",
      "Eliminated 100% of config-related deployment incidents",
    ],
    accentColor: "#ec4899",
  },
];
