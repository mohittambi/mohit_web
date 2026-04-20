import type { BlogPost } from "../types";

const NESTED_SAGA_MERMAID = `graph TD
    A[Standard Workflow: Parent Saga] --> B{Standard: Await Callback}
    A --> C[Task: Trigger Sub-Saga]

    subgraph exp["Express Workflow (High Volume / Low Cost)"]
        C --> D[Task: Deduct Wallet]
        D -->|Retry Storms handled here| D
        D --> E[Task: Allocate Inventory]
        E -->|Failure| F[Compensate: Refund Wallet]
    end

    E -->|Success| G[Return Success to Parent]
    F -->|Fail| H[Return Fail to Parent]

    G --> B
    H --> I[Standard: Cancel Order]

    style A stroke:#E5E7EB,stroke-width:1px
    style C stroke:#00F0FF,stroke-width:2px
    style D stroke:#E5E7EB,stroke-width:1px`;

export const post: BlogPost = {
  slug: "event-driven-sagas-recovery",
  title: "Event-Driven Sagas: Compensations, Timeouts, and Human-in-the-Loop Recovery",
  description:
    "Choreography vs Step Functions orchestration, ap-south-1 state transition economics, compensation multiplier, Standard-Parent + Express-Child nested sagas, and waitForTaskToken human approval without idle compute cost.",
  publishedAt: "2026-04-09",
  readTime: "10 min read",
  difficulty: "Deep dive",
  tags: ["Saga", "Events", "Microservices", "Architecture", "AWS", "FinOps"],
  sections: [
    {
      kind: "p",
      text: "The worst place to be as an engineer is staring at a production database at 2:00 AM, writing a manual SQL `UPDATE` to refund a user because a distributed transaction failed halfway through.",
    },
    {
      kind: "p",
      text: "At A23, a user buying into a tournament spanned three distinct microservices: **Wallet**, **Tournament Engine**, and **Notification**. If the Wallet deducted the balance, but the Tournament Engine crashed before allocating the seat, the user lost their money and got nothing in return.",
    },
    {
      kind: "p",
      text: "In a monolith, you wrap everything in an ACID SQL transaction and `ROLLBACK`. In a distributed architecture, there are no global transactions. You must build **Sagas**.",
    },
    {
      kind: "p",
      text: "But sagas are expensive, and poorly designed sagas are financially ruinous. Here is the 2026 blueprint for orchestrating distributed compensations, avoiding the \"Stuck Saga\" trap, and managing the exact cloud economics of state persistence.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "1. The Choreography vs. Orchestration Trap",
    },
    {
      kind: "p",
      text: "When teams first break up a monolith, they default to **Choreography**: Service A emits an event, Service B listens, does its job, and emits another event.",
    },
    {
      kind: "p",
      text: "Choreography works brilliantly for passive notifications. It is a nightmare for core business flows. When a payment fails on step 4, how do you tell Service A to roll back? You end up building a spaghetti network of failure events that is impossible to trace or debug.",
    },
    {
      kind: "p",
      text: "For high-stakes transactions (payments, supply chain procurements), you must use **Orchestration**. You need a central coordinator—like **AWS Step Functions**—that dictates the flow and enforces compensations.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "2. The Persistence Tax in ap-south-1",
    },
    {
      kind: "p",
      text: "Orchestration provides safety, but it charges a **Persistence Tax**.",
    },
    {
      kind: "p",
      text: "If you use **AWS Step Functions (Standard Workflows)**, you are not paying for compute time. You are paying for **State Transitions**. Every time your saga moves from `Start` → `Task` → `Choice` → `Success`, AWS records that transition durably across three Availability Zones.",
    },
    {
      kind: "p",
      text: "In `ap-south-1` (Mumbai), **Standard Workflows** cost **`$0.025` per 1,000** state transitions.",
    },
    {
      kind: "p",
      text: "**The \"Happy Path\" Math**",
    },
    {
      kind: "p",
      text: "A typical 4-step order saga (Order → Payment → Inventory → Shipping) requires roughly **12** state transitions per execution (including `Choice` states and parallel branches).",
    },
    {
      kind: "ul",
      items: [
        "**1,000,000** orders = **12,000,000** transitions.",
        "**Monthly cost:** **`$300.00`** (12M / 1,000 × $0.025).",
      ],
    },
    {
      kind: "p",
      text: "This seems reasonable. But then, the real world happens.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "3. The Compensation Multiplier",
    },
    {
      kind: "p",
      text: "What happens when a step fails? Sagas cannot \"roll back\"; they must **compensate**. If the inventory allocation fails, the saga must explicitly call the Payment service to `Refund_Wallet` and the Order service to `Cancel_Order`.",
    },
    {
      kind: "p",
      text: "A failure at step 4 requires:",
    },
    {
      kind: "ol",
      items: [
        "**3** explicit compensation tasks.",
        "**8** additional routing and error-catching transitions.",
      ],
    },
    {
      kind: "p",
      text: "This is the **Compensation Multiplier**. A failed business process is **2×** more expensive in infrastructure than a successful one. If your downstream payment gateway goes down and triggers an aggressive **Retry** loop before finally failing and compensating, a single **`$0.0003`** execution can balloon into a **`$0.005`** execution.",
    },
    {
      kind: "p",
      text: "Multiply that by a **10%** failure rate on **100 million** B2B supply chain events, and you are burning thousands of dollars on \"noise.\"",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: '4. The "Nested Saga" Architecture',
    },
    {
      kind: "p",
      text: "To survive high volumes, you must split your orchestrator using the **Standard-Parent / Express-Child** pattern.",
    },
    {
      kind: "ul",
      items: [
        "**Express Workflows** cost **`$1.00` per 1M executions** plus memory duration. They are incredibly cheap but offer **at-least-once** delivery and lose their state after **5 minutes**.",
        "**Standard Workflows** guarantee **exactly-once** execution and hold state for up to **1 year**, but cost **per transition**.",
      ],
    },
    {
      kind: "p",
      text: "**The solution:** Use a **Standard** workflow for the durable **parent** lifecycle (waiting for days for a shipping callback), but offload all fast, noisy, highly-retried API calls to an **Express** **child** workflow.",
    },
    { kind: "mermaid", code: NESTED_SAGA_MERMAID },
    {
      kind: "p",
      text: "Moving **10** internal inventory-check transitions from the Standard parent to the Express child reduces the parent's state transition bill by **~80%**.",
    },
    { kind: "hr" },
    {
      kind: "h2",
      text: "5. Human-in-the-Loop (.waitForTaskToken)",
    },
    {
      kind: "p",
      text: "Not all sagas can be fully automated. In B2B supply chain (like the platforms we build at **i2b**), if an AI procurement engine detects a **400%** price spike from a vendor, the saga must pause for human approval.",
    },
    {
      kind: "p",
      text: "You cannot use a Lambda function to \"sleep\" and wait for a human—that burns idle compute money. You cannot build a custom DynamoDB polling engine—that burns Read Capacity Units.",
    },
    {
      kind: "p",
      text: "The architectural primitive for this is the **callback pattern**.",
    },
    {
      kind: "p",
      text: "When Step Functions calls your Lambda to alert the human, you pass a **`.waitForTaskToken`** flag. Step Functions halts execution immediately. It generates a unique cryptographic token and goes to sleep. **You are charged `$0` for this idle time.** Days later, when the Operations Manager clicks \"Approve\" in your internal dashboard, your backend calls **`SendTaskSuccess(TaskToken)`**. The saga wakes up exactly where it left off, securely injecting the human's approval payload into the execution state.",
    },
    {
      kind: "system_alert",
      label: "Principal's Note: The Expiry Trap",
      text:
        "A saga waiting for a human can wait for up to **1 year**. If you do not configure an explicit `TimeoutSeconds` on your task token state, a forgotten approval request will hang in your system indefinitely, locking up any resources (like reserved inventory) tied to that execution. Always enforce a hard **timeout** that triggers an automatic compensation.",
    },
    {
      kind: "h2",
      text: "The Saga Readiness Checklist",
    },
    {
      kind: "ol",
      items: [
        "**Idempotent Tasks:** If your saga retries a **Refund** step, the downstream API *must* use an idempotency key (like the **`ExecutionArn`**) so it doesn't double-refund.",
        "**Dead Letter Sagas:** If a saga exhausts all retries and compensations *fail*, where does it go? Route failed states to an **SQS DLQ** for manual engineering review.",
        "**Log Sinks:** Standard workflows log transition histories inherently, but Express workflows require explicit **CloudWatch Logging** configuration. Turn it on, or you will be completely blind during an outage.",
      ],
    },
  ],
};
