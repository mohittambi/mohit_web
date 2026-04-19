/** Canonical site origin — keep in sync with `app/layout.tsx` metadataBase. */
export const SITE_ORIGIN = "https://mohittambi.in";

/** Public contact for blog feedback mailto — keep in sync with Person JSON-LD in `app/layout.tsx`. */
export const CONTACT_EMAIL = "er.mohittambi@gmail.com";

export function blogPostUrl(slug: string): string {
  return `${SITE_ORIGIN}/blog/${slug}`;
}
