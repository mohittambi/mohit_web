"use client";
import { useEffect, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface ToolbarPos { text: string; x: number; y: number }

export function SelectionToolbar({
  postUrl,
  postTitle,
}: Readonly<{ postUrl: string; postTitle: string }>) {
  const [pos, setPos] = useState<ToolbarPos | null>(null);
  const [copied, setCopied] = useState(false);

  const onSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!text || text.length < 12 || !sel?.rangeCount) { setPos(null); return; }
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    setPos({ text, x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + window.scrollY });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", onSelectionChange);
    document.addEventListener("touchend", onSelectionChange);
    const hide = () => { if (!window.getSelection()?.toString().trim()) setPos(null); };
    document.addEventListener("mousedown", hide);
    return () => {
      document.removeEventListener("mouseup", onSelectionChange);
      document.removeEventListener("touchend", onSelectionChange);
      document.removeEventListener("mousedown", hide);
    };
  }, [onSelectionChange]);

  const handleCopy = async () => {
    if (!pos) return;
    await navigator.clipboard.writeText(pos.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const shareX = () => {
    if (!pos) return;
    const t = `"${pos.text.slice(0, 220)}" — ${postTitle}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(postUrl)}`, "_blank", "noopener");
  };

  const shareLinkedIn = () => {
    if (!pos) return;
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(postTitle)}&summary=${encodeURIComponent(pos.text.slice(0, 256))}`, "_blank", "noopener");
  };

  if (!pos) return null;

  return (
    <div
      className="absolute z-50 -translate-x-1/2 pointer-events-auto select-none"
      style={{ left: pos.x, top: pos.y - 48 }}
    >
      <div className="flex items-center gap-0.5 bg-[var(--text)] rounded-lg px-1.5 py-1 shadow-xl ring-1 ring-black/10">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCopy}
          className="flex items-center gap-1 text-[var(--bg)] text-[11px] font-medium px-2.5 py-1 rounded-md hover:bg-white/15 transition-colors"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
        <div className="w-px h-3.5 bg-white/20" />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={shareX}
          className="text-[var(--bg)] text-[11px] font-bold px-2.5 py-1 rounded-md hover:bg-white/15 transition-colors"
          title="Share on X"
        >
          𝕏
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={shareLinkedIn}
          className="text-[var(--bg)] text-[11px] font-semibold px-2.5 py-1 rounded-md hover:bg-white/15 transition-colors"
          title="Share on LinkedIn"
        >
          in
        </button>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[var(--text)]" />
    </div>
  );
}
