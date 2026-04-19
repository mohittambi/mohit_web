import { post as ragWithoutRegret } from "./posts/rag-without-regret";
import { post as lambdaToEcsWhenServerlessStops } from "./posts/lambda-to-ecs-when-serverless-stops";
import { post as idempotentWebhooksOutboxesDlq } from "./posts/idempotent-webhooks-outboxes-dlq";
import { post as opentelemetrySamplingCost } from "./posts/opentelemetry-sampling-cost";
import { post as promptEngineeringForEngineers } from "./posts/prompt-engineering-for-engineers";
import { post as llmApiTokenBudgets } from "./posts/llm-api-token-budgets";
import { post as contextWindowsCachingSessions } from "./posts/context-windows-caching-sessions";
import { post as batchVsStreamingEmbeddings } from "./posts/batch-vs-streaming-embeddings";
import { post as dynamodbHotPartitions } from "./posts/dynamodb-hot-partitions";
import { post as eventDrivenSagasRecovery } from "./posts/event-driven-sagas-recovery";
import { post as platformMetricsSlisSlos } from "./posts/platform-metrics-slis-slos";
import { post as idpWithoutBoilingOcean } from "./posts/idp-without-boiling-ocean";

const allPosts = [
  ragWithoutRegret,
  lambdaToEcsWhenServerlessStops,
  idempotentWebhooksOutboxesDlq,
  opentelemetrySamplingCost,
  promptEngineeringForEngineers,
  llmApiTokenBudgets,
  contextWindowsCachingSessions,
  batchVsStreamingEmbeddings,
  dynamodbHotPartitions,
  eventDrivenSagasRecovery,
  platformMetricsSlisSlos,
  idpWithoutBoilingOcean,
];

/** Stable titles for cross-links (e.g. narrative read-next) without duplicating strings. */
export const postTitleBySlug: Record<string, string> = Object.fromEntries(
  allPosts.map((p) => [p.slug, p.title]),
);
