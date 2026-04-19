export interface TechGroup {
  category: string;
  icon: string;
  items: string[];
  description: string;
}

export const techStack: TechGroup[] = [
  {
    category: "Backend",
    icon: "Code2",
    items: ["Node.js", "TypeScript", "Python", "Java", "Express", "Spring Boot", "REST APIs", "GraphQL", "WebSockets", "gRPC"],
    description: "Production-grade API and service design at scale",
  },
  {
    category: "Cloud & AWS",
    icon: "Cloud",
    items: [
      "ECS Fargate",
      "Lambda",
      "DynamoDB",
      "SQS / SNS",
      "API Gateway",
      "CloudWatch",
      "X-Ray",
      "ECR",
      "S3",
      "RDS",
      "ElastiCache",
      "Cloudflare R2",
    ],
    description: "Deep AWS expertise from serverless to containers",
  },
  {
    category: "Data & Storage",
    icon: "Database",
    items: ["PostgreSQL", "DynamoDB", "MongoDB", "MySQL", "Redis", "Event Sourcing", "CQRS", "AWS Redshift"],
    description: "Right storage for the right problem",
  },
  {
    category: "Architecture",
    icon: "Network",
    items: [
      "Distributed Systems",
      "Microservices",
      "Event-Driven Architecture",
      "Domain-Driven Design",
      "Saga Pattern",
      "Transactional Outbox",
      "CQRS",
      "RabbitMQ",
    ],
    description: "Patterns that survive real-world failures",
  },
  {
    category: "Observability",
    icon: "Activity",
    items: ["OpenTelemetry", "Grafana", "Loki", "AWS X-Ray", "CloudWatch Dashboards", "Sumo Logic", "Structured Logging"],
    description: "Instrumented systems that explain themselves",
  },
  {
    category: "AI & Tooling",
    icon: "Sparkles",
    items: [
      "Generative AI",
      "RAG (Retrieval-Augmented Generation)",
      "LLM Fine-Tuning",
      "AI/ML Model Deployment",
      "GitHub Copilot",
      "Claude (Anthropic)",
      "Google Gemini",
      "ChatGPT / OpenAI APIs",
      "Prompt Engineering & Evals",
      "Context Retention & Caching",
      "Batch & Async LLM Pipelines",
      "Token Budgets & API Cost Controls",
    ],
    description: "AI as an engineering force multiplier",
  },
  {
    category: "CI/CD & DevOps",
    icon: "GitBranch",
    items: ["GitHub Actions", "Docker", "Terraform", "ECR", "Blue-Green Deployments", "Linux / RHEL (RHCE)", "IaC"],
    description: "Reliable, automated delivery pipelines",
  },
];
