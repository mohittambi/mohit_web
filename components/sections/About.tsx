"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Users, Shield, Layers, BrainCircuit } from "lucide-react";

/* Inline highlight: accent = numbers/impact, strong = role/concept */
function H({ children }: Readonly<{ children: React.ReactNode }>) {
  return <span className="text-[var(--text)] font-semibold">{children}</span>;
}
function N({ children }: Readonly<{ children: React.ReactNode }>) {
  return <span className="text-[var(--accent)] font-semibold">{children}</span>;
}

const pillars = [
  {
    icon: Layers,
    title: "Architecture at Scale",
    body: "Designed cloud-native platforms for 7M+ users — monolith-to-microservices migrations, serverless-first with Lambda & ECS Fargate, DynamoDB single-table patterns that saved $9K/month.",
  },
  {
    icon: BrainCircuit,
    title: "AI & Innovation",
    body: "Architecting RAG-powered chatbots and LLM integrations at i2b that reduced support time by 40%. Leading B2B supply chain AI with predictive procurement and inventory intelligence.",
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    body: "WAF rules, rate limiting, PII field-level encryption, and OWASP-aligned API hardening cut DDoS/brute-force incidents by 60%. Compliance-grade immutable audit trails, secrets rotation via AWS Secrets Manager, and least-privilege IAM — all on platforms sustaining 99.99% uptime.",
  },
  {
    icon: Users,
    title: "Team Leadership",
    body: "Built and mentored an 8-member engineering team, drove recruitment from Tier-1 institutions, and improved team delivery efficiency by 50% through standards, review culture, and coaching.",
  },
];

const credentials = [
  { value: "7M+",    label: "Users Served"          },
  { value: "$9K/mo", label: "Infrastructure Saved"   },
  { value: "99.99%", label: "Uptime SLA"             },
  { value: "60%",    label: "DDoS Incidents Reduced" },
  { value: "8",      label: "Engineers Led"          },
  { value: "10+",    label: "Years in Production"    },
];

export function About() {
  return (
    <section id="about" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* ── Left: text ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <SectionHeader
              label="About"
              title="Engineering systems that need to be right under pressure."
            />

            <div className="space-y-5 text-[var(--muted)] leading-relaxed">
              <p>
                I&apos;m a <H>Platform Architect and Engineering Leader</H> with{" "}
                <N>10 years</N> of experience designing{" "}
                <H>cloud-native, distributed, and serverless systems</H> — from high-throughput
                event pipelines to AI-enabled platforms. My work has served{" "}
                <N>7M+ users</N>, delivered <N>99.99% uptime</N>, and driven measurable business
                impact through architecture decisions that compound over time.
              </p>

              <p>
                At <H>Head Digital Works (A23.com)</H>, I led the migration from monolith to{" "}
                <H>microservices</H>, spearheaded{" "}
                <H>serverless-first architectures</H> with Lambda and ECS Fargate, and defined{" "}
                <H>DynamoDB single-table design patterns</H> that saved{" "}
                <N>$9K/month</N> in infrastructure costs. I built real-time{" "}
                <H>wallet reconciliation engines</H>, implemented{" "}
                <H>PII encryption + WAF</H> protections that reduced DDoS incidents by{" "}
                <N>60%</N>, and delivered a{" "}
                <H>RAG-powered chatbot</H> that cut customer support handling time by{" "}
                <N>40%</N>.
              </p>

              <p>
                Currently at <H>i2b Technologies</H> as Principal Engineer, I&apos;m directing the
                architectural roadmap for two core products — a <H>B2C communication platform</H>{" "}
                and a <H>B2B AI supply chain engine</H> using predictive procurement and inventory
                intelligence. I lead through architecture decisions and through people — having built
                and mentored an <N>8-member engineering team</N>, driven recruitment from{" "}
                <H>Tier-1 institutions</H>, and improved team delivery efficiency by <N>50%</N>.
              </p>

              <p>
                At this stage of my career, I&apos;m most effective at the intersection of{" "}
                <H>complex system design</H> and{" "}
                <H>engineering leadership</H> — where the right architecture decision at the right
                time creates compounding leverage for an entire product and team.
              </p>
            </div>

            {/* Credentials grid */}
            <div className="mt-8 pt-8 border-t border-[var(--border-color)] grid grid-cols-3 gap-5">
              {credentials.map((c) => (
                <div key={c.label}>
                  <p className="text-xl font-bold text-[var(--accent)]">{c.value}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-snug">{c.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right: pillars ────────────────────────────────── */}
          <div className="grid sm:grid-cols-2 gap-4">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 hover:border-[var(--accent)]/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                  <p.icon size={18} className="text-[var(--accent)]" />
                </div>
                <h3 className="font-semibold text-[var(--text)] text-sm mb-1.5">{p.title}</h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
