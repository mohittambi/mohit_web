import type { NarrativeAppendix } from "../narrative-appendix-types";
import { narrativeAppendix as ragWithoutRegret } from "./rag-without-regret";
import { narrativeAppendix as lambdaToEcsWhenServerlessStops } from "./lambda-to-ecs-when-serverless-stops";
import { narrativeAppendix as idempotentWebhooksOutboxesDlq } from "./idempotent-webhooks-outboxes-dlq";
import { narrativeAppendix as opentelemetrySamplingCost } from "./opentelemetry-sampling-cost";
import { narrativeAppendix as promptEngineeringForEngineers } from "./prompt-engineering-for-engineers";
import { narrativeAppendix as llmApiTokenBudgets } from "./llm-api-token-budgets";
import { narrativeAppendix as contextWindowsCachingSessions } from "./context-windows-caching-sessions";
import { narrativeAppendix as batchVsStreamingEmbeddings } from "./batch-vs-streaming-embeddings";
import { narrativeAppendix as dynamodbHotPartitions } from "./dynamodb-hot-partitions";
import { narrativeAppendix as eventDrivenSagasRecovery } from "./event-driven-sagas-recovery";
import { narrativeAppendix as platformMetricsSlisSlos } from "./platform-metrics-slis-slos";
import { narrativeAppendix as idpWithoutBoilingOcean } from "./idp-without-boiling-ocean";

export const narrativeAppendixBySlug: Record<string, NarrativeAppendix> = {
  "rag-without-regret": ragWithoutRegret,
  "lambda-to-ecs-when-serverless-stops": lambdaToEcsWhenServerlessStops,
  "idempotent-webhooks-outboxes-dlq": idempotentWebhooksOutboxesDlq,
  "opentelemetry-sampling-cost": opentelemetrySamplingCost,
  "prompt-engineering-for-engineers": promptEngineeringForEngineers,
  "llm-api-token-budgets": llmApiTokenBudgets,
  "context-windows-caching-sessions": contextWindowsCachingSessions,
  "batch-vs-streaming-embeddings": batchVsStreamingEmbeddings,
  "dynamodb-hot-partitions": dynamodbHotPartitions,
  "event-driven-sagas-recovery": eventDrivenSagasRecovery,
  "platform-metrics-slis-slos": platformMetricsSlisSlos,
  "idp-without-boiling-ocean": idpWithoutBoilingOcean,
};
