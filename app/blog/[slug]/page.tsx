import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BlogPostBody } from "@/components/blog/BlogPostBody";
import { BlogComments } from "@/components/blog/BlogComments";
import { Badge } from "@/components/ui/Badge";
import { DifficultyChip } from "@/components/blog/DifficultyChip";
import { getAllBlogSlugs, getBlogPostBySlug } from "@/data/blogPosts";

const SITE_URL = "https://mohittambi.in";

type Props = Readonly<{ params: Promise<{ slug: string }> }>;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Not found" };
  }
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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-10"
        >
          <ArrowLeft size={16} aria-hidden />
          All posts
        </Link>

        <header className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">Blog</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-[var(--muted)] leading-relaxed text-lg mb-4">{post.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold tabular-nums text-[var(--text)]">
              {post.readTime}
            </span>
            <DifficultyChip level={post.difficulty} />
            <span className="text-[var(--muted)]">·</span>
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
          </div>
          <div className="flex flex-wrap gap-2 mt-5">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="subtle">
                {tag}
              </Badge>
            ))}
          </div>
        </header>

        <BlogPostBody sections={post.sections} />

        <BlogComments slug={slug} title={post.title} />
      </div>
    </article>
  );
}
