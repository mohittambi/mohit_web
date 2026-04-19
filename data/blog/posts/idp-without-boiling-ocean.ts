import type { BlogPost } from "../types";

export const post: BlogPost = {
  slug: "idp-without-boiling-ocean",
  title: "Building an Internal Developer Platform Without Boiling the Ocean",
  description:
    "Golden paths, paved roads, and sequencing that earns trust before you centralise everything.",
  publishedAt: "2026-04-07",
  readTime: "10 min read",
  tags: ["Platform", "DevEx", "Kubernetes", "Culture", "Developer Experience"],
  sections: [
    {
      kind: "p",
      text: "Internal developer platforms fail when they are a big-bang mandate from a team far from delivery pressure. Successful IDPs start as narrow golden paths that remove toil for one critical workflow, then expand by invitation. Treat the IDP as **Developer Experience (DevEx) infrastructure**, not a portal skin: the goal is to stop your strongest engineers from quitting because every ship still feels like editing **raw YAML** in three repos and begging for kube-context in Slack.",
    },
    {
      kind: "h2",
      text: "DevEx and retention: beyond the portal",
    },
    {
      kind: "p",
      text: "Measure **time-to-first-deploy**, **MTTR**, and a lightweight **toil index** (support tickets, pager noise, “how do I wire IAM?” DMs). When those flatline while headcount grows, you are paying retention tax. A golden path that hides Kubernetes unless someone opts in is often cheaper than teaching every product team the entire control plane. Celebrate when teams **delete** bespoke Helm from their services—that is the same signal as revenue in internal platforms.",
    },
    {
      kind: "h2",
      text: "Golden path first",
    },
    {
      kind: "p",
      text: "Pick one service template: build, test, deploy, observability, and access patterns baked in. Measure time-to-first-deploy and mean time to recovery for teams on the path versus off it. Publish those numbers—adoption follows proof.",
    },
    {
      kind: "h2",
      text: "Self-service with guardrails",
    },
    {
      kind: "p",
      text: "Paved roads should be the easiest option, not the only one. Policy-as-code and automated checks catch mistakes early; human exceptions need a visible process. Chargeback or showback transparency keeps platform teams accountable for cost and complexity they introduce.",
    },
    {
      kind: "h2",
      text: "Organisational sequencing",
    },
    {
      kind: "p",
      text: "Staff platform squads with engineers who have shipped production services recently. Rotate product engineers through the platform team. Celebrate reductions in bespoke YAML more than raw feature count—the goal is flow, not footprint.",
    },
  ],
};
