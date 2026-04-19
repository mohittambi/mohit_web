import type { BlogPost } from "../types";
import { post as ragWithoutRegret } from "./rag-without-regret";
import { post as lambdaToEcsWhenServerlessStops } from "./lambda-to-ecs-when-serverless-stops";
import { post as idempotentWebhooksOutboxesDlq } from "./idempotent-webhooks-outboxes-dlq";
import { post as opentelemetrySamplingCost } from "./opentelemetry-sampling-cost";
import { post as promptEngineeringForEngineers } from "./prompt-engineering-for-engineers";
import { post as llmApiTokenBudgets } from "./llm-api-token-budgets";
import { post as contextWindowsCachingSessions } from "./context-windows-caching-sessions";
import { post as batchVsStreamingEmbeddings } from "./batch-vs-streaming-embeddings";
import { post as dynamodbHotPartitions } from "./dynamodb-hot-partitions";
import { post as eventDrivenSagasRecovery } from "./event-driven-sagas-recovery";
import { post as platformMetricsSlisSlos } from "./platform-metrics-slis-slos";
import { post as idpWithoutBoilingOcean } from "./idp-without-boiling-ocean";

/** Long-form body only; narrative + career layers merge in `getBlogPostBySlug`. */
export const blogPosts: BlogPost[] = [
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
