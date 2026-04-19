"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface Job {
  company: string;
  role: string;
  period: string;
  current?: boolean;
  highlights: string[];
  tags: string[];
}

const jobs: Job[] = [
  {
    company: "i2b Technologies Pvt. Ltd.",
    role: "Principal Engineer",
    period: "Nov 2025 — Present",
    current: true,
    highlights: [
      "Directing the architectural roadmap for two core products: a B2C communication platform and a B2B electronics supply chain AI engine.",
      "Architecting RAG frameworks and LLM integrations to automate data extraction, predictive procurement, and inventory intelligence.",
      "Standardising IaC with Terraform and AWS across multi-product environments, maintaining cost parity with high availability SLAs.",
    ],
    tags: ["RAG", "LLM", "Node.js", "AWS", "Terraform", "Microservices"],
  },
  {
    company: "Head Digital Works (A23.com)",
    role: "Platform Architect & Engineering Lead",
    period: "Jan 2023 — Oct 2025",
    highlights: [
      "Architected and led cloud-native platforms serving 7M+ users — real-time game integrations, high-throughput wallet management, and seamless user journeys.",
      "Spearheaded monolith-to-microservices migration with serverless-first design (Lambda, ECS Fargate, DynamoDB); DynamoDB single-table patterns saved $9K/month.",
      "Reduced cloud spend by 30% and connection overhead by 40% through event-driven architectures with RabbitMQ and ECS.",
      "Led platform security: PII encryption, WAF protections, Grafana/Loki observability — cut DDoS and brute-force incidents by 60%.",
      "Delivered 99.99% uptime SLA; led an 8-member engineering team with mentorship, design reviews, and Tier-1 talent acquisition.",
    ],
    tags: ["AWS", "ECS Fargate", "Lambda", "DynamoDB", "RabbitMQ", "Grafana", "Node.js", "TypeScript"],
  },
  {
    company: "Pristyn Care",
    role: "Tech Lead",
    period: "Dec 2021 — Dec 2022",
    highlights: [
      "Managed a 5-engineer team delivering serverless applications at 99.9% uptime — patient management dashboards and doctor prescription workflows.",
      "Built a secure data funnel streamlining ETL processes across the organisation; improved debugging efficiency by 30% via Sumo Logic and Sentry.",
    ],
    tags: ["Node.js", "Serverless", "AWS Lambda", "Sumo Logic", "Sentry"],
  },
  {
    company: "Finalatix Technologies",
    role: "Lead Software Engineer",
    period: "Mar 2021 — Dec 2021",
    highlights: [
      "Led development of a custom Node.js framework reducing development cycles; integrated Terraform for infrastructure automation.",
      "Mentored team on full-stack best practices and component-based architecture.",
    ],
    tags: ["Node.js", "Terraform", "AWS", "Full-stack"],
  },
  {
    company: "Peak AI",
    role: "Software Engineer",
    period: "Jan 2019 — Feb 2021",
    highlights: [
      "Engineered a data ingestion platform using DB and file connectors, aggregating TBs of data from multiple sources into Redshift for AI/ML processing.",
    ],
    tags: ["AWS Redshift", "Data Engineering", "Python", "React"],
  },
  {
    company: "LUCID UX · Webcontxt · Design Prefect",
    role: "Software Developer",
    period: "Apr 2016 — Jan 2019",
    highlights: [
      "Web development, custom CMS systems, insurance workflow automation, and eCommerce solutions using PHP, WordPress, and shell scripting.",
    ],
    tags: ["PHP", "WordPress", "JavaScript"],
  },
];

export function Experience() {
  return (
    <section id="experience" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            label="Experience"
            title="A decade of building systems that matter."
            description="From startups to platforms serving millions — each role added a layer of scale, complexity, and ownership."
          />
        </motion.div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-[var(--border-color)] hidden sm:block" />

          <div className="space-y-0">
            {jobs.map((job, i) => (
              <motion.div
                key={job.company + job.role}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="relative sm:pl-10 pb-10 last:pb-0 group"
              >
                {/* Timeline dot */}
                <div
                  className={`hidden sm:flex absolute left-0 top-1.5 w-6 h-6 rounded-full items-center justify-center border-2 transition-colors z-10 ${
                    job.current
                      ? "border-[var(--accent)] bg-[var(--accent)]"
                      : "border-[var(--border-color)] bg-[var(--bg)] group-hover:border-[var(--accent)]"
                  }`}
                >
                  {job.current && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>

                <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-6 hover:border-[var(--accent)]/30 transition-colors">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[var(--text)]">{job.role}</h3>
                        {job.current && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--muted)] mt-0.5">{job.company}</p>
                    </div>
                    <span className="text-xs text-[var(--muted)] whitespace-nowrap font-mono mt-1 sm:mt-0">
                      {job.period}
                    </span>
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-2 mb-4">
                    {job.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2.5 text-sm text-[var(--muted)] leading-relaxed">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]/50 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {job.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded-md border border-[var(--border-color)] bg-[var(--bg)] text-[var(--muted)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
