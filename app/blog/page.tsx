import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { articles } from "@/data/articles";
import { getBlogPostsForListing } from "@/data/blogPosts";
import { BlogIndexWithTags } from "@/components/blog/BlogIndexWithTags";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Engineering articles on distributed systems, AWS, AI-assisted development, and production lessons — on this site and on Medium.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog | Mohit Tambi",
    description: "Architecture, cloud, reliability, and AI engineering notes.",
    url: "/blog",
  },
};

export default function BlogPage() {
  const fullPosts = getBlogPostsForListing();
  const sitePosts = fullPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    publishedAt: p.publishedAt,
    readTime: p.readTime,
    difficulty: p.difficulty,
    tags: p.tags,
  }));

  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-10"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to home
        </Link>

        <header className="mb-14 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-2">Writing</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight mb-4">Blog</h1>
          <p className="text-[var(--muted)] leading-relaxed text-lg">
            Long-form engineering notes on this site, plus selected articles on Medium. Tags come from on-site posts and
            filter both sections.
          </p>
        </header>

        <BlogIndexWithTags sitePosts={sitePosts} articles={articles} />
      </div>
    </div>
  );
}
