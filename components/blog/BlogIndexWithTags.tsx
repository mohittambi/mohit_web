"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Lightbulb, X } from "lucide-react";
import type { Article } from "@/data/articles";
import { Badge } from "@/components/ui/Badge";
import type { BlogDifficulty } from "@/data/blog/types";
import { DifficultyChip } from "@/components/blog/DifficultyChip";
import { isPrimaryBlogFilterTag } from "@/data/blog/primary-tags";

export type BlogListingPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: string;
  difficulty: BlogDifficulty;
  tags: string[];
};

type Props = Readonly<{
  sitePosts: BlogListingPost[];
  articles: Article[];
}>;

/** Tags that appear on at least one on-site post (excludes Medium-only labels). */
function tagsUsedOnSite(sitePosts: BlogListingPost[]): string[] {
  const set = new Set<string>();
  for (const p of sitePosts) for (const t of p.tags) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Primary theme tags first (accent hierarchy), then alphabetical secondary tags. */
function sortTagsForFilter(tags: readonly string[]): string[] {
  const primary: string[] = [];
  const secondary: string[] = [];
  for (const t of tags) {
    if (isPrimaryBlogFilterTag(t)) primary.push(t);
    else secondary.push(t);
  }
  primary.sort((a, b) => a.localeCompare(b));
  secondary.sort((a, b) => a.localeCompare(b));
  return [...primary, ...secondary];
}

function matchesTags(tags: string[], selected: Set<string>): boolean {
  if (selected.size === 0) return true;
  return tags.some((t) => selected.has(t));
}

export function BlogIndexWithTags({ sitePosts, articles }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const filterTags = sortTagsForFilter(tagsUsedOnSite(sitePosts));

  const filteredSite = sitePosts.filter((p) => matchesTags(p.tags, selected));
  const filteredArticles = articles.filter((a) => matchesTags(a.tags, selected));

  function toggleTag(tag: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function clearTags() {
    setSelected(new Set());
  }

  const tagBar =
    filterTags.length > 0 ? (
      <div
        className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 sm:px-4 sm:py-2.5"
        aria-label="Filter by tag"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] shrink-0">Filter</span>
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {filterTags.map((tag) => {
              const on = selected.has(tag);
              const primary = isPrimaryBlogFilterTag(tag);
              const baseRing =
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] transition-[color,background-color,border-color,box-shadow] duration-150";
              const offPrimary =
                "border-[var(--accent)]/40 bg-[var(--accent-muted)] text-[var(--accent)] hover:bg-[var(--accent)]/15 hover:border-[var(--accent)]/55";
              const offSecondary =
                "border-[var(--border-color)] bg-[var(--bg)] text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)] hover:border-[var(--border-color)]";
              const onCls =
                "border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]";
              const idleCls = primary ? offPrimary : offSecondary;
              const chipCls = on ? onCls : idleCls;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] sm:text-xs font-medium leading-tight font-mono tabular-nums ${baseRing} ${chipCls}`}
                  aria-pressed={on}
                  data-tag-tier={primary ? "primary" : "secondary"}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          {selected.size > 0 && (
            <button
              type="button"
              onClick={clearTags}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] shrink-0 ml-auto"
            >
              <X size={12} aria-hidden />
              Clear
            </button>
          )}
        </div>
        <p className="text-[10px] text-[var(--muted)] mt-1.5 tabular-nums">
          On-site {filteredSite.length}/{sitePosts.length}
          {articles.length > 0 ? ` · Medium ${filteredArticles.length}/${articles.length}` : ""}
        </p>
      </div>
    ) : null;

  const mainColumn = (
    <div className="min-w-0 space-y-16">
      <section aria-labelledby="site-heading">
        <h2 id="site-heading" className="text-lg font-semibold text-[var(--text)] mb-2">
          On this site
        </h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          Power Trio (weeks 1–3): RAG → Lambda to ECS → DynamoDB hot partitions. Week 4 leads with idempotent webhooks;
          then LLM cost, sagas, OTel, and the rest—the posts below are listed in that reading order.
        </p>
        {filteredSite.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-8 text-center rounded-xl border border-dashed border-[var(--border-color)]">
            No on-site posts match these tags.{" "}
            <button type="button" onClick={clearTags} className="text-[var(--accent)] font-medium hover:underline">
              Clear filters
            </button>
          </p>
        ) : (
          <ul className="space-y-4">
            {filteredSite.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5 sm:p-6 transition-colors hover:border-[var(--accent)]/40"
                >
                  <h3 className="font-semibold text-[var(--text)] text-lg leading-snug group-hover:text-[var(--accent)] transition-colors mb-2">
                    {post.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-[var(--bg)] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[var(--text)]">
                      {post.readTime}
                    </span>
                    <DifficultyChip level={post.difficulty} />
                    <time className="text-[11px] text-[var(--muted)] tabular-nums" dateTime={post.publishedAt}>
                      {post.publishedAt}
                    </time>
                  </div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">{post.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="subtle">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="medium-heading">
        <h2 id="medium-heading" className="text-lg font-semibold text-[var(--text)] mb-6">
          On Medium
        </h2>
        {filteredArticles.length === 0 ? (
          <p className="text-sm text-[var(--muted)] py-8 text-center rounded-xl border border-dashed border-[var(--border-color)]">
            No Medium articles match these tags.{" "}
            <button type="button" onClick={clearTags} className="text-[var(--accent)] font-medium hover:underline">
              Clear filters
            </button>
          </p>
        ) : (
          <ul className="space-y-6">
            {filteredArticles.map((article) => (
              <li
                key={article.url}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-6 sm:p-7"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-[var(--accent)]" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text)] text-lg leading-snug">{article.title}</h3>
                      <p className="text-sm text-[var(--muted)]">{article.subtitle}</p>
                      <p className="text-xs text-[var(--muted)] mt-1">
                        {article.publishedAt} · {article.readTime}
                      </p>
                    </div>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors shrink-0"
                  >
                    Read on Medium <ArrowUpRight size={14} aria-hidden />
                  </a>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="subtle">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2 pt-4 border-t border-[var(--border-color)]">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                    <Lightbulb size={12} aria-hidden /> Key insights
                  </p>
                  <ul className="space-y-2">
                    {article.insights.map((insight) => (
                      <li key={insight} className="text-sm text-[var(--muted)] leading-relaxed pl-3 border-l-2 border-[var(--accent)]/40">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-center">
          <a
            href="https://medium.com/@er.mohittambi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            All posts on Medium <ArrowUpRight size={14} aria-hidden />
          </a>
        </p>
      </section>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {tagBar}
      {mainColumn}
    </div>
  );
}
