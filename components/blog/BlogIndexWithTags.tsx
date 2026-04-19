"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Columns2, Lightbulb, X } from "lucide-react";
import type { Article } from "@/data/articles";
import { Badge } from "@/components/ui/Badge";

export type BlogListingPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
};

type Props = Readonly<{
  sitePosts: BlogListingPost[];
  articles: Article[];
}>;

function uniqueTags(sitePosts: BlogListingPost[], articles: Article[]): string[] {
  const set = new Set<string>();
  for (const p of sitePosts) for (const t of p.tags) set.add(t);
  for (const a of articles) for (const t of a.tags) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b));
}

function matchesTags(tags: string[], selected: Set<string>): boolean {
  if (selected.size === 0) return true;
  return tags.some((t) => selected.has(t));
}

export function BlogIndexWithTags({ sitePosts, articles }: Props) {
  const [tagsOnLeft, setTagsOnLeft] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const allTags = uniqueTags(sitePosts, articles);

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

  const tagPanel = (
    <aside
      className="lg:sticky lg:top-28 lg:self-start space-y-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-5"
      aria-label="Filter by tag"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Tags</p>
        <button
          type="button"
          onClick={() => setTagsOnLeft((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-color)] bg-[var(--bg)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          title={tagsOnLeft ? "Move tag panel to the right" : "Move tag panel to the left"}
        >
          <Columns2 size={12} aria-hidden />
          {tagsOnLeft ? "Right" : "Left"}
        </button>
      </div>
      <p className="text-xs text-[var(--muted)] leading-relaxed">
        Select one or more tags. Posts match if they have <span className="text-[var(--text)] font-medium">any</span> selected tag.
      </p>
      {selected.size > 0 && (
        <button
          type="button"
          onClick={clearTags}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
        >
          <X size={14} aria-hidden />
          Clear ({selected.size})
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const on = selected.has(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                on
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
                  : "border-[var(--border-color)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text)]"
              }`}
              aria-pressed={on}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-[var(--muted)] border-t border-[var(--border-color)] pt-3">
        On-site: {filteredSite.length}/{sitePosts.length} · Medium: {filteredArticles.length}/{articles.length}
      </p>
    </aside>
  );

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
                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-3">{post.description}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                    <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
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
    <div
      className={`flex flex-col gap-8 lg:flex-row lg:items-start ${tagsOnLeft ? "" : "lg:flex-row-reverse"}`}
    >
      {tagPanel}
      {mainColumn}
    </div>
  );
}
