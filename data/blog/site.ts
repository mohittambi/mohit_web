/** Canonical site origin  --  keep in sync with `app/layout.tsx` metadataBase. */
export const SITE_ORIGIN = "https://mohittambi.in";

/** Public contact for blog feedback mailto  --  keep in sync with Person JSON-LD in `app/layout.tsx`. */
export const CONTACT_EMAIL = "er.mohittambi@gmail.com";

/** Mobile  --  `tel:` uses E.164; label is for UI. Keep in sync with Person `telephone` in `app/layout.tsx`. */
export const CONTACT_PHONE_E164 = "+919509340191";
export const CONTACT_PHONE_LABEL = "+91 95093 40191";

/** WhatsApp chat  --  same number as mobile unless you split later. */
export const CONTACT_WHATSAPP_URL = `https://wa.me/${CONTACT_PHONE_E164.replaceAll(/\D/g, "")}`;

export function blogPostUrl(slug: string): string {
  return `${SITE_ORIGIN}/blog/${slug}`;
}
