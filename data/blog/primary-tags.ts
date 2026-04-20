/**
 * Tags shown with accent emphasis in the /blog filter strip (vs muted secondary tags).
 * Exact match to strings used in post `tags` arrays (see `data/blog/posts/*.ts`).
 */
export const PRIMARY_BLOG_FILTER_TAGS = [
  "Architecture",
  "AWS",
  "Distributed Systems",
  "LLM",
  "FinOps",
  "RAG",
  "Observability",
] as const;

const primarySet = new Set<string>(PRIMARY_BLOG_FILTER_TAGS);

export function isPrimaryBlogFilterTag(tag: string): boolean {
  return primarySet.has(tag);
}
