import type { CareerArtifacts } from "../career-artifacts-types";
import { careerArtifacts as ragWithoutRegret } from "./rag-without-regret";
import { careerArtifacts as lambdaToEcsWhenServerlessStops } from "./lambda-to-ecs-when-serverless-stops";
import { careerArtifacts as idempotentWebhooksOutboxesDlq } from "./idempotent-webhooks-outboxes-dlq";
import { careerArtifacts as opentelemetrySamplingCost } from "./opentelemetry-sampling-cost";
import { careerArtifacts as promptEngineeringForEngineers } from "./prompt-engineering-for-engineers";
import { careerArtifacts as llmApiTokenBudgets } from "./llm-api-token-budgets";
import { careerArtifacts as contextWindowsCachingSessions } from "./context-windows-caching-sessions";
import { careerArtifacts as batchVsStreamingEmbeddings } from "./batch-vs-streaming-embeddings";
import { careerArtifacts as dynamodbHotPartitions } from "./dynamodb-hot-partitions";
import { careerArtifacts as eventDrivenSagasRecovery } from "./event-driven-sagas-recovery";
import { careerArtifacts as platformMetricsSlisSlos } from "./platform-metrics-slis-slos";
import { careerArtifacts as idpWithoutBoilingOcean } from "./idp-without-boiling-ocean";

export const careerArtifactBySlug: Record<string, CareerArtifacts> = {
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
