import { codeToHtml } from "shiki";

interface Props {
  code: string;
  language: string;
  title?: string;
}

export async function CodeBlock({ code, language, title }: Readonly<Props>) {
  let html: string;
  try {
    html = await codeToHtml(code.trim(), {
      lang: language,
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    });
  } catch {
    html = `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border-color)] my-1">
      {title && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border-color)]">
          <span className="flex gap-1.5" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
          </span>
          <span className="text-[11px] text-[var(--muted)] font-mono ml-1">{title}</span>
        </div>
      )}
      <div
        className="shiki-block text-[13px] leading-relaxed overflow-x-auto [&>pre]:p-4 [&>pre]:m-0 [&>pre]:rounded-none [&>pre]:overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
