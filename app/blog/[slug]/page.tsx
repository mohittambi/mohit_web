import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { BlogPostBody } from "@/components/blog/BlogPostBody";
import { BlogComments } from "@/components/blog/BlogComments";
import { BlogTOC } from "@/components/blog/BlogTOC";
import { BlogPostNav } from "@/components/blog/BlogPostNav";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ReadAloudController } from "@/components/blog/ReadAloudController";
import { SelectionToolbar } from "@/components/blog/SelectionToolbar";
import { Badge } from "@/components/ui/Badge";
import { DifficultyChip } from "@/components/blog/DifficultyChip";
import { getAllBlogSlugs, getBlogPostBySlug, getAdjacentAndRecommended } from "@/data/blogPosts";

const SITE_URL = "https://mohittambi.in";

type Props = Readonly<{ params: Promise<{ slug: string }> }>;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

function slugify(text: string) {
  return text.toLowerCase().replaceAll(/[^\w\s-]/g, "").trim().replaceAll(/\s+/g, "-");
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const headings = post.sections
    .filter((s) => s.kind === "h2")
    .map((s) => ({ id: slugify((s as { kind: "h2"; text: string }).text), text: (s as { kind: "h2"; text: string }).text }));

  const postUrl = `${SITE_URL}/blog/${slug}`;
  const { prev, next, recommended } = getAdjacentAndRecommended(slug);

  return (
    <>
      <ReadingProgress />

      {/* Single read-aloud root: hero + body + TOC (see docs/read-aloud/PLAN_WITH_PHASE_VALIDATION.md) */}
      <div data-read-aloud>
      {/* Hero header */}
      <div className="hero-gradient pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-8"
          >
            <ArrowLeft size={15} aria-hidden />
            All posts
          </Link>

          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-4">
            {post.tags[0]}
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] tracking-tight leading-tight mb-5">
            {post.title}
          </h1>

          <p className="text-lg text-[var(--muted)] leading-relaxed mb-7 max-w-2xl">
            {post.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <Clock size={13} aria-hidden />
              {post.readTime}
            </span>
            <DifficultyChip level={post.difficulty} />
            <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <Calendar size={13} aria-hidden />
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </span>
            <ReadAloudController />
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="subtle">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-color)]" />

      {/* Body + TOC */}
      <div className="px-6 pb-24 pt-12">
        <div className="max-w-6xl mx-auto flex items-start gap-0">
          <article className="flex-1 min-w-0 max-w-3xl relative">
            <SelectionToolbar postUrl={postUrl} postTitle={post.title} />
            <BlogPostBody sections={post.sections} />
            <div className="mt-16">
              <BlogComments slug={slug} title={post.title} />
            </div>
            <BlogPostNav prev={prev} next={next} recommended={recommended} />
          </article>

          <BlogTOC headings={headings} />
        </div>
      </div>
      </div>
    </>
  );
}
