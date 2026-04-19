export interface Article {
  title: string;
  subtitle: string;
  url: string;
  readTime: string;
  tags: string[];
  insights: string[];
  publishedAt: string;
}

export const articles: Article[] = [
  {
    title: "From AWS Lambda to ECS: A Deep-Dive Migration Story",
    subtitle: "That Transformed Our Platform",
    url: "https://medium.com/@er.mohittambi/from-aws-lambda-to-ecs-a-deep-dive-migration-story-that-transformed-our-platform-64c12c560240",
    readTime: "12 min read",
    tags: ["AWS", "ECS", "Lambda", "Architecture", "Cost Optimization"],
    insights: [
      "Cold starts aren't just a latency problem — they're an architectural constraint that shapes every downstream design decision.",
      "A migration is only zero-downtime if rollback is one command, not one incident.",
      "Task sizing math: ceil((peak_RPS × avg_latency) / concurrency_per_task) — the formula that determines whether your migration succeeds under load.",
    ],
    publishedAt: "2024",
  },
];
