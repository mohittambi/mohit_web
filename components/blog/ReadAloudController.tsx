"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

/*
 * Read-aloud stack:
 *
 * 1. SpeechSynthesis / SpeechSynthesisUtterance (Web Speech API)
 *    One utterance per paragraph element — enables natural breaks between
 *    paragraphs and sidesteps the Chrome bug where pause() breaks on long
 *    single-utterance text.
 *
 * 2. onboundary (word event)
 *    Fires with charIndex + charLength into the current utterance's string.
 *
 * 3. document.createTreeWalker (NodeFilter.SHOW_TEXT)
 *    Walks all Text nodes inside a single paragraph element, skipping
 *    script/style. Rebuilt per paragraph so offsets are local.
 *
 * 4. Flat offset map
 *    Concatenates text node content → one string per paragraph.
 *    Records each node's start offset so charIndex maps back to a DOM node.
 *
 * 5. document.createRange + globalThis.getSelection().addRange()
 *    Turns (textNode, charOffset) → DOM range → browser text highlight.
 *
 * 6. 250 ms setTimeout between utterances
 *    Creates the audible paragraph pause.
 */

const PARA_SELECTORS = "h2, h3, p, li, pre, blockquote, th, td";
const PAUSE_MS = 250;

interface ParaChunk {
  el: Element;
  text: string;
  nodes: Text[];
  offsets: number[];
}

function skipTag(tag: string) {
  return ["script", "style", "noscript", "button", "nav"].includes(tag);
}

function buildChunk(el: Element): ParaChunk | null {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (skipTag(p.tagName.toLowerCase())) return NodeFilter.FILTER_REJECT;
      return (node.textContent?.trim() ?? "").length > 0
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP;
    },
  });
  const nodes: Text[] = [];
  let n = walker.nextNode();
  while (n) { nodes.push(n as Text); n = walker.nextNode(); }
  if (nodes.length === 0) return null;

  let text = "";
  const offsets: number[] = [];
  for (const node of nodes) {
    offsets.push(text.length);
    text += node.textContent ?? "";
  }
  return text.trim().length > 0 ? { el, text, nodes, offsets } : null;
}

function selectWord(chunk: ParaChunk, charIndex: number, charLength: number) {
  const sel = globalThis.getSelection();
  if (!sel) return;
  const end = charIndex + charLength;
  let startNode: Text | null = null, startOff = 0;
  let endNode: Text | null = null, endOff = 0;

  for (let i = 0; i < chunk.nodes.length; i++) {
    const nodeEl = chunk.nodes[i];
    const ns = chunk.offsets[i];
    if (nodeEl === undefined || ns === undefined) continue;
    const ne = ns + (nodeEl.textContent?.length ?? 0);
    if (!startNode && charIndex >= ns && charIndex < ne) {
      startNode = nodeEl;
      startOff = charIndex - ns;
    }
    if (!endNode && end <= ne) {
      endNode = nodeEl;
      endOff = end - ns;
      break;
    }
  }
  if (!startNode || !endNode) return;
  try {
    const range = document.createRange();
    range.setStart(startNode, startOff);
    range.setEnd(endNode, endOff);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch { /* DOM may shift during speech */ }
}

export function ReadAloudController() {
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const chunksRef = useRef<ParaChunk[]>([]);
  const idxRef = useRef(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  const clearTimer = () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = null;
  };

  const cleanup = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
    globalThis.speechSynthesis?.cancel();
    globalThis.getSelection()?.removeAllRanges();
    idxRef.current = 0;
    setState("idle");
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const speakChunk = useCallback((idx: number) => {
    const chunks = chunksRef.current;
    if (stoppedRef.current || idx >= chunks.length) {
      if (idx >= chunks.length) {
        globalThis.getSelection()?.removeAllRanges();
        setState("idle");
      }
      return;
    }

    const chunk = chunks[idx];
    if (!chunk) return;
    idxRef.current = idx;

    const utt = new SpeechSynthesisUtterance(chunk.text);
    utt.rate = 0.95;
    utt.pitch = 1;

    utt.onboundary = (e: SpeechSynthesisEvent) => {
      if (e.name === "word") selectWord(chunk, e.charIndex, e.charLength ?? 1);
    };

    utt.onend = () => {
      if (stoppedRef.current) return;
      pauseTimerRef.current = setTimeout(() => {
        if (!stoppedRef.current) speakChunk(idx + 1);
      }, PAUSE_MS);
    };

    utt.onerror = () => { if (!stoppedRef.current) cleanup(); };

    globalThis.speechSynthesis.speak(utt);
  }, [cleanup]);

  const startReading = useCallback(() => {
    const article = document.querySelector("article[data-read-aloud]");
    if (!article) return;

    const els = Array.from(article.querySelectorAll(PARA_SELECTORS));
    const seen = new WeakSet<Element>();
    const chunks: ParaChunk[] = [];

    for (const el of els) {
      if (seen.has(el)) continue;
      // skip if an ancestor was already included
      let anc: Element | null = el.parentElement;
      let nested = false;
      while (anc) {
        if (seen.has(anc)) { nested = true; break; }
        anc = anc.parentElement;
      }
      if (nested) continue;
      const chunk = buildChunk(el);
      if (chunk) { chunks.push(chunk); seen.add(el); }
    }

    if (chunks.length === 0) return;
    chunksRef.current = chunks;
    stoppedRef.current = false;
    globalThis.speechSynthesis.cancel();
    speakChunk(0);
    setState("playing");
  }, [speakChunk]);

  const toggle = () => {
    if (state === "idle") {
      startReading();
    } else if (state === "playing") {
      clearTimer();
      globalThis.speechSynthesis.pause();
      setState("paused");
    } else {
      globalThis.speechSynthesis.resume();
      // if paused in the gap (timer), restart from current chunk
      if (!globalThis.speechSynthesis.speaking) speakChunk(idxRef.current);
      setState("playing");
    }
  };

  if (typeof globalThis.window !== "undefined" && !globalThis.speechSynthesis) return null;

  let toggleTitle = "Read aloud";
  if (state === "playing") toggleTitle = "Pause";
  else if (state === "paused") toggleTitle = "Resume";

  let toggleLabel: React.ReactNode = <><Volume2 size={13} /> Read aloud</>;
  if (state === "playing") toggleLabel = <><Pause size={13} /> Pause</>;
  else if (state === "paused") toggleLabel = <><Play size={13} /> Resume</>;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={toggle}
        title={toggleTitle}
        className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border-color)]"
      >
        {toggleLabel}
      </button>
      {state !== "idle" && (
        <button
          onClick={cleanup}
          title="Stop reading"
          className="text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1.5 rounded-lg hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border-color)]"
        >
          <VolumeX size={13} />
        </button>
      )}
    </div>
  );
}
