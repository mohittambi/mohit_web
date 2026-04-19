import { Fragment } from "react";
import type { ReactNode } from "react";

/** Strip trailing punctuation accidentally glued to pasted URLs. */
export function hrefForUrlToken(raw: string): string {
  return raw.replace(/[),.;:]+$/u, "");
}

function linkLabelForHref(href: string): string {
  try {
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "mohittambi.in" && u.pathname.startsWith("/blog/")) {
      return "Read on this site";
    }
    if (host.includes("opentelemetry.io")) return "OpenTelemetry docs";
    if (host.includes("aws.amazon.com")) return "AWS documentation";
    if (host === "platform.openai.com" || host === "openai.com") return "OpenAI documentation";
    if (host.includes("anthropic.com")) return "Anthropic documentation";
    if (host.includes("sre.google")) return "Google SRE Book";
    if (host.includes("microservices.io")) return "microservices.io — saga pattern";
    if (host.includes("owasp.org")) return "OWASP — webhooks security";
    if (host.includes("cncf.io")) return "CNCF — platform engineering";
    if (host.includes("medium.com")) return "Medium article";

    return `${host} (opens in new tab)`;
  } catch {
    return "Open link";
  }
}

const anchorClass =
  "font-medium text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-hover)] decoration-[var(--accent)]/50";

/**
 * Turns markdown-style `**phrase**` into bold emphasis. Safe for untrusted-ish CMS strings: no HTML pass-through.
 */
export function renderBoldSegments(text: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  const re = /\*\*(.+?)\*\*/g;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      out.push(text.slice(last, match.index));
    }
    out.push(
      <strong key={`em-${key++}`} className="font-semibold text-[var(--text)]">
        {match[1]}
      </strong>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    out.push(text.slice(last));
  }
  return out.length === 0 ? text : <>{out}</>;
}

/** URL segments become `<a>` with readable labels; other segments get bold parsing. */
function renderProseWithLabeledLinks(text: string): ReactNode {
  const parts = text.split(/(https?:\/\/[^\s<]+)/gi);
  if (parts.length === 1) {
    return renderBoldSegments(text);
  }
  return (
    <>
      {parts.map((part, i) => {
        if (part === "") return null;
        if (/^https?:\/\//i.test(part)) {
          const href = hrefForUrlToken(part);
          return (
            <a
              key={`a-${i}-${href.slice(0, 20)}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={anchorClass}
            >
              {linkLabelForHref(href)}
            </a>
          );
        }
        return <Fragment key={`t-${i}`}>{renderBoldSegments(part)}</Fragment>;
      })}
    </>
  );
}

/**
 * One “reference / distribution” line: prefers readable link text over raw URLs
 * (`URL — note`, `Label: URL`, single URL, or prose with embedded URLs).
 */
export function renderDistributionLine(text: string): ReactNode {
  const t = text.trim();

  const dashNote = t.match(/^(https?:\/\/\S+?)\s*[—–]\s*(.+)$/u);
  if (dashNote) {
    const href = hrefForUrlToken(dashNote[1]);
    const note = dashNote[2];
    return (
      <>
        <a href={href} target="_blank" rel="noopener noreferrer" className={anchorClass}>
          {linkLabelForHref(href)}
        </a>
        <span className="text-[var(--muted)]"> — {renderBoldSegments(note)}</span>
      </>
    );
  }

  const labelThenUrl = t.match(/^(.{2,160}?):\s*(https?:\/\/\S+)$/u);
  if (labelThenUrl) {
    const href = hrefForUrlToken(labelThenUrl[2]);
    const label = labelThenUrl[1].trim();
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={anchorClass}>
        {label}
      </a>
    );
  }

  if (/^https?:\/\/\S+$/u.test(t)) {
    const href = hrefForUrlToken(t);
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={anchorClass}>
        {linkLabelForHref(href)}
      </a>
    );
  }

  return renderProseWithLabeledLinks(t);
}
