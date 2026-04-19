/**
 * Power Trio — first three weeks (signal + interview arc):
 * Week 1 RAG (market demand), Week 2 Lambda→ECS (principal cost vs complexity), Week 3 DynamoDB (scale architect).
 * Week 4 opens the “tactical core” idempotent webhooks; remaining posts follow.
 */
export const publishPriorityOrder: string[] = [
  "rag-without-regret",
  "lambda-to-ecs-when-serverless-stops",
  "dynamodb-hot-partitions",
  "idempotent-webhooks-outboxes-dlq",
  "llm-api-token-budgets",
  "event-driven-sagas-recovery",
  "opentelemetry-sampling-cost",
  "context-windows-caching-sessions",
  "prompt-engineering-for-engineers",
  "batch-vs-streaming-embeddings",
  "platform-metrics-slis-slos",
  "idp-without-boiling-ocean",
];

export function sortBlogPostsByPublishPriority<T extends { slug: string }>(posts: T[]): T[] {
  const order = new Map(publishPriorityOrder.map((slug, i) => [slug, i]));
  return [...posts].sort((a, b) => (order.get(a.slug) ?? 999) - (order.get(b.slug) ?? 999));
}
