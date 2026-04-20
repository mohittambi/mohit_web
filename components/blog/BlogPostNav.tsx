import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/data/blogPosts";
import { Badge } from "@/components/ui/Badge";
import { DifficultyChip } from "@/components/blog/DifficultyChip";

interface Props {
  prev: BlogPost | null;
  next: BlogPost | null;
  recommended: BlogPost[];
}

function PostCard({ post }: Readonly<{ post: BlogPost }>) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]/40 transition-colors"
    >
      <div className="flex items-center gap-2">
        <DifficultyChip level={post.difficulty} />
        <span className="text-[10px] text-[var(--muted)]">{post.readTime}</span>
      </div>
      <p className="text-sm font-semibold text-[var(--text)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
        {post.title}
      </p>
      <p className="text-[12px] text-[var(--muted)] leading-relaxed line-clamp-2">{post.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        {post.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="subtle">{t}</Badge>
        ))}
      </div>
    </Link>
  );
}

export function BlogPostNav({ prev, next, recommended }: Readonly<Props>) {
  return (
    <div className="mt-16 space-y-10">
      {/* Prev / Next */}
      {(prev ?? next) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {prev ? (
            <Link
              href={`/blog/${prev.slug}`}
              className="group flex-1 flex items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
            >
              <ArrowLeft size={15} className="mt-0.5 shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-0.5">Previous</p>
                <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug">
                  {prev.title}
                </p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          {next ? (
            <Link
              href={`/blog/${next.slug}`}
              className="group flex-1 flex items-start gap-3 justify-end text-right rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-0.5">Next</p>
                <p className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug">
                  {next.title}
                </p>
              </div>
              <ArrowRight size={15} className="mt-0.5 shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
            </Link>
          ) : <div className="flex-1" />}
        </div>
      )}

      {/* Recommended */}
      {recommended.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)] mb-4">
            Recommended reading
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommended.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
