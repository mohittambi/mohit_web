# Blog research notes (regional / pricing / math)

Short-lived **authoring** artifacts: pricing tables, crossover math, and outline-to-section maps. **Do not treat rates as permanent truth**—re-check AWS before each publish.

## Workflow (documents first, then implementation)

1. **Document** — Add or extend a `post-{nn}-…` file here (thesis, rates, math, outline § map, pre-publish checklist). Link it from `docs/BLOG_CONTENT_PLAN.md` for the relevant post when useful.
2. **Implement** — Only after the research doc is stable: update `data/blog/posts/{slug}.ts`, narrative/career barrels if needed, and any UI that renders those blocks; re-run pricing in the AWS calculator at ship time.

Skipping step 1 for region- or $-heavy claims tends to mix regions and assumptions in production copy. Step 2 is intentionally second.

| Post | Topic | File |
| :--- | :---- | :--- |
| 2 | Lambda → ECS, Mumbai FinOps & NAT | [post-02-lambda-ecs-ap-south-1-finops.md](./post-02-lambda-ecs-ap-south-1-finops.md) |
| 3 | Idempotent webhooks, DynamoDB WRU / outbox / Streams+TTL | [post-03-idempotent-webhooks-ap-south-1-dynamodb.md](./post-03-idempotent-webhooks-ap-south-1-dynamodb.md) |
| 4 | OpenTelemetry, ingestion vs retention, tail sampling, Mumbai egress | [post-04-opentelemetry-ap-south-1-observability-bill.md](./post-04-opentelemetry-ap-south-1-observability-bill.md) |
| 5 | Prompt engineering, few-shot unit economics, prompt drift, fine-tune crossover | [post-05-prompt-engineering-few-shot-unit-economics.md](./post-05-prompt-engineering-few-shot-unit-economics.md) |
| 6 | LLM API budgets, model routing FinOps, tagging, dashboards | [post-06-llm-api-token-budgets-routing-finops.md](./post-06-llm-api-token-budgets-routing-finops.md) |
| 7 | Context windows, cache economics, Gemini vs Claude caching | [post-07-context-windows-cache-economics.md](./post-07-context-windows-cache-economics.md) |
| 8 | Batch vs streaming, backfill economics, checkpointing, eval harness | [post-08-batch-streaming-backfill-economics.md](./post-08-batch-streaming-backfill-economics.md) |
| 9 | DynamoDB hot partitions, 100k RPS wall, sharding, Mumbai pricing | [post-09-dynamodb-hot-partitions-100k-rps-wall.md](./post-09-dynamodb-hot-partitions-100k-rps-wall.md) |
| 11 | SLOs / fourth nine economics, RaR, composite availability, tiering | [post-11-platform-metrics-fourth-nine-economics.md](./post-11-platform-metrics-fourth-nine-economics.md) |
| 12 | IDP TCO, build vs buy, TTFD, India golden path, 90-day MVP | [post-12-idp-tco-paving-the-road.md](./post-12-idp-tco-paving-the-road.md) |

Add new files as `post-{nn}-{slug-short}-{topic}.md` and extend this table.
