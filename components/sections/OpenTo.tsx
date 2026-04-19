"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const types = [
  "Distributed Systems",
  "Platform Engineering",
  "Staff / Principal Roles",
  "Advisory & Consulting",
  "Architecture Reviews",
  "Technical Leadership",
];

export function OpenTo() {
  return (
    <section id="open" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] p-8 sm:p-12"
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--accent)] mb-4">
            Availability
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight mb-4 max-w-2xl">
            Open to high-impact roles and meaningful engineering challenges.
          </h2>
          <p className="text-[var(--muted)] text-lg max-w-2xl mb-8 leading-relaxed">
            If you're working on systems where correctness, scale, and reliability matter —
            and you need someone who has built in that environment before — let's talk.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-10">
            {types.map((t) => (
              <span
                key={t}
                className="text-sm px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 text-[var(--accent)]"
              >
                {t}
              </span>
            ))}
          </div>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Let&apos;s Talk <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
