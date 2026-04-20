"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import { caseStudies } from "@/data/caseStudies";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CASE_DIAGRAMS } from "./CaseDiagrams";

export function CaseStudies() {
  const [expanded, setExpanded] = useState<string | null>("lambda-to-ecs");

  return (
    <section id="work" className="py-24 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            label="Impact"
            title="What I've built and what it changed."
            description="These aren't demos. Each represents a real problem with real constraints — and an outcome tied to business impact."
          />
        </motion.div>

        <div className="space-y-3">
          {caseStudies.map((cs, i) => {
            const isOpen = expanded === cs.id;
            return (
              <motion.div
                key={cs.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] overflow-hidden"
              >
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : cs.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--surface)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: cs.accentColor }}
                    />
                    <div>
                      <p className="text-xs text-[var(--muted)] mb-1">{cs.category}</p>
                      <h3 className="text-lg font-semibold text-[var(--text)]">{cs.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {/* Key outcome pill */}
                    <span
                      className="hidden sm:inline-flex text-xs px-3 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: `${cs.accentColor}15`,
                        color: cs.accentColor,
                      }}
                    >
                      {cs.outcomes[0]}
                    </span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-[var(--muted)]" />
                    ) : (
                      <ChevronDown size={18} className="text-[var(--muted)]" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 border-t border-[var(--border-color)]">
                        <div className="grid md:grid-cols-3 gap-8 pt-6">
                          {/* Problem + Solution */}
                          <div className="md:col-span-2 space-y-5">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">
                                Problem
                              </h4>
                              <p className="text-sm text-[var(--muted)] leading-relaxed">
                                {cs.problem}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">
                                Constraints
                              </h4>
                              <ul className="space-y-1">
                                {cs.constraints.map((c) => (
                                  <li key={c} className="flex items-start gap-2 text-sm text-[var(--muted)]">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--muted)] flex-shrink-0" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">
                                Solution
                              </h4>
                              <p className="text-sm text-[var(--muted)] leading-relaxed">
                                {cs.solution}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-2">
                                Tech Stack
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {cs.tech.map((t) => (
                                  <Badge key={t}>{t}</Badge>
                                ))}
                              </div>
                            </div>

                            {/* Architecture diagram */}
                            {(() => {
                              const Diagram = CASE_DIAGRAMS[cs.id];
                              return Diagram ? <Diagram /> : null;
                            })()}
                          </div>

                          {/* Outcomes */}
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-3">
                              Outcomes
                            </h4>
                            <div className="space-y-2">
                              {cs.outcomes.map((o) => (
                                <div
                                  key={o}
                                  className="flex items-start gap-2 p-3 rounded-lg"
                                  style={{ backgroundColor: `${cs.accentColor}08` }}
                                >
                                  <ArrowUpRight
                                    size={14}
                                    className="mt-0.5 flex-shrink-0"
                                    style={{ color: cs.accentColor }}
                                  />
                                  <span className="text-xs text-[var(--text)] leading-relaxed">
                                    {o}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
