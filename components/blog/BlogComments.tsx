"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { CONTACT_EMAIL } from "@/data/blog/site";

type Props = Readonly<{
  slug: string;
  title: string;
}>;

const giscusRepo = process.env.NEXT_PUBLIC_GISCUS_REPO;
const giscusRepoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
const giscusCategoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
const giscusCategory = process.env.NEXT_PUBLIC_GISCUS_CATEGORY ?? "Announcements";

const giscusEnabled = Boolean(giscusRepo && giscusRepoId && giscusCategoryId);

function giscusTheme(resolved: string | undefined): string {
  if (resolved === "dark") return "dark_dimmed";
  return "light";
}

function EmailCommentForm({ slug, title }: Props) {
  const [body, setBody] = useState("");

  function openMailto(e: { preventDefault: () => void }) {
    e.preventDefault();
    const sub = encodeURIComponent(`Blog comment: ${title}`);
    const text = `Page: /blog/${slug}\n\n${body}`.slice(0, 1700);
    const bod = encodeURIComponent(text);
    globalThis.location.href = `mailto:${CONTACT_EMAIL}?subject=${sub}&body=${bod}`;
  }

  return (
    <form onSubmit={openMailto} className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-6 space-y-4">
      <p className="text-sm text-[var(--muted)] leading-relaxed">
        Comments on this page use your email app. For public threads with GitHub login, configure Giscus — see{" "}
        <code className="text-xs bg-[var(--bg)] px-1 rounded">docs/COMMENTS.md</code>.
      </p>
      <div>
        <label htmlFor="blog-comment" className="block text-sm font-medium text-[var(--text)] mb-2">
          Your comment
        </label>
        <textarea
          id="blog-comment"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
          placeholder="Write here…"
        />
      </div>
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        disabled={!body.trim()}
      >
        <MessageSquare size={16} aria-hidden />
        Send via email
      </button>
    </form>
  );
}

export function BlogComments({ slug, title }: Props) {
  const { resolvedTheme } = useTheme();
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!giscusEnabled || !hostRef.current) return;
    hostRef.current.replaceChildren();
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", giscusRepo!);
    script.setAttribute("data-repo-id", giscusRepoId!);
    script.setAttribute("data-category", giscusCategory);
    script.setAttribute("data-category-id", giscusCategoryId!);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", giscusTheme(resolvedTheme));
    script.setAttribute("data-lang", "en");
    hostRef.current.appendChild(script);
  }, [slug, resolvedTheme]);

  return (
    <section aria-labelledby="comments-heading" className="mt-16 pt-12 border-t border-[var(--border-color)]">
      <h2 id="comments-heading" className="text-xl font-semibold text-[var(--text)] tracking-tight mb-6">
        Comments
      </h2>
      {giscusEnabled ? (
        <div ref={hostRef} className="giscus min-h-[120px]" />
      ) : (
        <EmailCommentForm slug={slug} title={title} />
      )}
    </section>
  );
}
