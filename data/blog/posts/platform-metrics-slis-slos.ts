import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "platform-metrics-slis-slos",
  title: "Platform Metrics That Leadership Actually Trust: SLIs, SLOs, and Error Budgets",
  description:
    "Connecting user-perceived reliability to metrics executives can reason about—and budgets that change behaviour.",
  publishedAt: "2026-04-08",
  readTime: "8 min read",
  tags: ["SRE", "SLO", "Leadership", "Observability"],
  sections: [
    {
      kind: "p",
      text: "Uptime percentages without user context invite cynicism. SLIs grounded in request success, latency percentiles, and freshness for data products align engineering work with what customers feel.",
    },
    {
      kind: "h2",
      text: "SLIs you can defend",
    },
    {
      kind: "ul",
      items: [
        "Measure from the edge or client where possible, not only inside the happy VPC path.",
        "Exclude known bad clients only with written policy—otherwise you are optimising dashboards, not experience.",
        "Keep SLI definitions in version control with change history.",
      ],
    },
    {
      kind: "h2",
      text: "SLOs and error budgets as negotiation",
    },
    {
      kind: "p",
      text: "An error budget is the currency for velocity versus stability. When the budget burns, freeze risky launches, pay down debt, and invest in automation. When budget is healthy, product can absorb more experimentation. Review both SLI charts and budget policy quarterly so targets stay credible.",
    },
  ],
};
