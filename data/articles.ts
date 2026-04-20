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
      "Cold starts aren't just a latency problem  --  they're an architectural constraint that shapes every downstream design decision.",
      "A migration is only zero-downtime if rollback is one command, not one incident.",
      "Task sizing math: ceil((peak_RPS × avg_latency) / concurrency_per_task)  --  the formula that determines whether your migration succeeds under load.",
    ],
    publishedAt: "2024",
  },
  {
    title: "RAG Without Regret: Chunking, Embeddings, and Evaluating Retrieval Quality",
    subtitle: "How to build a retrieval layer that doesn't embarrass you in production",
    url: "/blog/rag-without-regret",
    readTime: "12 min read",
    tags: ["RAG", "LLM", "Embeddings", "AI Engineering", "MLOps"],
    insights: [
      "Chunks that split across semantic boundaries poison retrieval before a single prompt is written  --  chunking is a product decision, not a tokenizer setting.",
      "Embedding model choice is about query-document overlap, not benchmark leaderboards. Test on your own corpus.",
      "Offline evaluation metrics (MRR, NDCG) only matter when your test set looks like production queries. Build that set first.",
    ],
    publishedAt: "2026-04-18",
  },
  {
    title: "DynamoDB Hot Partitions: Patterns That Actually Work Under Write Spikes",
    subtitle: "Skewed keys, burst capacity, and design patterns that spread load",
    url: "/blog/dynamodb-hot-partitions",
    readTime: "10 min read",
    tags: ["DynamoDB", "AWS", "Architecture", "Performance"],
    insights: [
      "Burst capacity is a buffer, not a plan. If your P99 latency spikes every hour on the hour, you've already used it up.",
      "Write sharding with a suffix randomises partition distribution but requires scatter-gather on read  --  a deliberate tradeoff, not a free lunch.",
      "The real fix for hot partitions is usually a design problem: a table that looks like a queue, or a GSI that mirrors the base table's access pattern.",
    ],
    publishedAt: "2026-04-10",
  },
];
