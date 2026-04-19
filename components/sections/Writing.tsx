"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Lightbulb } from "lucide-react";
import { articles } from "@/data/articles";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Writing() {
  return (
    <section id="writing" className="py-24 bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeader
            label="Writing"
            title="Thinking in public."
            description="Engineering articles that go beyond syntax — architecture decisions, tradeoffs, and lessons from production."
          />
        </motion.div>

        <div className="space-y-6">
          {articles.map((article, i) => (
            <motion.div
              key={article.url}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg)] overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text)] text-lg leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-[var(--muted)] text-sm">{article.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-[var(--muted)]">{article.readTime}</span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md text-xs font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
                    >
                      Read <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="subtle">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Key insights */}
                <div className="space-y-3 pt-5 border-t border-[var(--border-color)]">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                    <Lightbulb size={12} /> Key Insights
                  </p>
                  {article.insights.map((insight) => (
                    <div
                      key={insight}
                      className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface)]"
                    >
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                      <p className="text-sm text-[var(--muted)] leading-relaxed italic">
                        &ldquo;{insight}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* More writing CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Blog page and backlog <ArrowUpRight size={14} />
          </Link>
          <a
            href="https://medium.com/@er.mohittambi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            More on Medium <ArrowUpRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
