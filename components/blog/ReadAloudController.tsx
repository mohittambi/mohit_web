"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  BookMarked,
  ListVideo,
} from "lucide-react";

/*
 * Read-aloud stack:
 *
 * 1. SpeechSynthesis / SpeechSynthesisUtterance (Web Speech API)
 *    One or more utterances per paragraph element (split on delimiters for
 *    intra-chunk pauses); multiple utterances still sidestep Chrome pause bugs
 *    on very long single strings.
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
 * 6. setTimeout gaps — weak/strong ms after commas etc. within a chunk; 250 ms
 *    (PAUSE_MS) between paragraph chunks.
 *
 * 7. speakGenRef — bump on user navigation / stop / new session so stale
 *    onend / timers do not chain after skip (see docs/read-aloud/).
 */

const PARA_SELECTORS = "h2, h3, p, li, pre, blockquote, th, td";
const PAUSE_MS = 250;
/** After weak delimiters inside a chunk (comma, semicolon, colon, em dash). */
const PAUSE_WEAK_MS = 120;
/** After sentence-ending . ! ? (conservative: . requires following whitespace or EOS). */
const PAUSE_STRONG_MS = 300;
/** Avoid tiny utterances when splitting on punctuation. */
const MIN_SEGMENT_CHARS = 16;

interface ParaChunk {
  el: Element;
  text: string;
  nodes: Text[];
  offsets: number[];
}

/** Sub-utterance of a ParaChunk for delimiter pauses; `baseOffset` maps into `chunk.text` for word highlight. */
interface SpeakSegment {
  text: string;
  pauseAfterMs: number;
  baseOffset: number;
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

function buildArticleChunks(article: Element): ParaChunk[] {
  const els = Array.from(article.querySelectorAll(PARA_SELECTORS));
  const seen = new WeakSet<Element>();
  const chunks: ParaChunk[] = [];

  for (const el of els) {
    if (seen.has(el)) continue;
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
  return chunks;
}

/** Index of the chunk whose block contains the selection anchor; null if none. */
function chunkIndexFromSelection(chunks: readonly ParaChunk[], article: Element): number | null {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const node = range.commonAncestorContainer;
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  if (!el || !article.contains(el)) return null;
  const block = el.closest(PARA_SELECTORS);
  if (!block || !article.contains(block)) return null;
  const i = chunks.findIndex((c) => c.el === block);
  return i >= 0 ? i : null;
}

/** Non-empty user text selection whose anchor lies inside the read-aloud root (Phase 2 preserve). */
function hasUserTextSelectionInArticle(root: Element): boolean {
  const sel = globalThis.getSelection();
  if (!sel?.rangeCount || sel.isCollapsed) return false;
  if (sel.toString().trim().length <= 0) return false;
  const r = sel.getRangeAt(0).commonAncestorContainer;
  const el = r.nodeType === Node.ELEMENT_NODE ? (r as Element) : r.parentElement;
  return !!(el && root.contains(el));
}

function restoreIndexAfterSingleSection(playedEl: Element | undefined, all: readonly ParaChunk[]): number {
  if (!playedEl) return 0;
  const i = all.findIndex((c) => c.el === playedEl);
  return Math.max(0, i);
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

/**
 * Split paragraph text into multiple spoken segments with short gaps after delimiters.
 * Skips `pre` (code) blocks. Offsets align with `chunk.text` for `selectWord`.
 */
function splitSpeakSegments(fullText: string, blockEl: Element): SpeakSegment[] {
  if (blockEl.tagName === "PRE" || blockEl.closest("pre")) {
    return [{ text: fullText, pauseAfterMs: 0, baseOffset: 0 }];
  }
  const t = fullText;
  if (t.length < MIN_SEGMENT_CHARS * 2) {
    return [{ text: t, pauseAfterMs: 0, baseOffset: 0 }];
  }

  const boundaries: { end: number; pause: number }[] = [];
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    let pause = 0;
    if (c === "," || c === ";" || c === ":" || c === "\u2014") {
      pause = PAUSE_WEAK_MS;
    } else if (c === "!" || c === "?" || c === ".") {
      const n = t[i + 1];
      if (n === undefined || /\s/.test(n)) pause = PAUSE_STRONG_MS;
    }
    if (pause > 0) boundaries.push({ end: i + 1, pause });
  }

  if (boundaries.length === 0) {
    return [{ text: t, pauseAfterMs: 0, baseOffset: 0 }];
  }

  let prev = 0;
  const pieces: { start: number; end: number; pauseAfterMs: number }[] = [];
  for (const b of boundaries) {
    if (b.end <= prev) continue;
    pieces.push({ start: prev, end: b.end, pauseAfterMs: b.pause });
    prev = b.end;
  }
  if (prev < t.length) {
    pieces.push({ start: prev, end: t.length, pauseAfterMs: 0 });
  }
  if (pieces.length === 0) {
    return [{ text: t, pauseAfterMs: 0, baseOffset: 0 }];
  }

  const merged: { start: number; end: number; pauseAfterMs: number }[] = [];
  let curStart = pieces[0].start;
  let curEnd = pieces[0].end;
  let pauseAfter = pieces[0].pauseAfterMs;
  for (let i = 1; i < pieces.length; i++) {
    const p = pieces[i];
    const curLen = curEnd - curStart;
    const nextLen = p.end - p.start;
    if (curLen < MIN_SEGMENT_CHARS || nextLen < MIN_SEGMENT_CHARS) {
      curEnd = p.end;
      pauseAfter = p.pauseAfterMs;
    } else {
      merged.push({ start: curStart, end: curEnd, pauseAfterMs: pauseAfter });
      curStart = p.start;
      curEnd = p.end;
      pauseAfter = p.pauseAfterMs;
    }
  }
  merged.push({ start: curStart, end: curEnd, pauseAfterMs: pauseAfter });

  return merged.map((p) => ({
    text: t.slice(p.start, p.end),
    pauseAfterMs: p.pauseAfterMs,
    baseOffset: p.start,
  }));
}

export function ReadAloudController() {
  /** Avoid hydration mismatch: SSR has no `speechSynthesis`; gate UI until client mount. */
  const [mounted, setMounted] = useState(false);

  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  /** Mirrors idxRef for Prev/Next disabled states (refs alone do not re-render). */
  const [currentIdx, setCurrentIdx] = useState(0);

  const chunksRef = useRef<ParaChunk[]>([]);
  /** Full article list; used to restore after “this section only”. */
  const allChunksRef = useRef<ParaChunk[]>([]);
  const idxRef = useRef(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);
  const speakGenRef = useRef(0);
  /** When true, skip per-word `selectWord` so user drag-selection stays visible (Phase 2). */
  const suppressWordHighlightRef = useRef(false);
  const sectionOutlineElRef = useRef<Element | null>(null);

  const clearTimer = () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = null;
  };

  const bumpSpeakGen = () => {
    speakGenRef.current += 1;
  };

  /** Clears both “this section only” and full-read current-chunk outlines. */
  const clearReadAloudSectionOutline = useCallback(() => {
    const el = sectionOutlineElRef.current;
    el?.classList.remove("read-aloud-section-active", "read-aloud-chunk-active");
    sectionOutlineElRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    stoppedRef.current = true;
    bumpSpeakGen();
    clearTimer();
    globalThis.speechSynthesis?.cancel();
    suppressWordHighlightRef.current = false;
    clearReadAloudSectionOutline();
    globalThis.getSelection()?.removeAllRanges();
    idxRef.current = 0;
    setCurrentIdx(0);
    chunksRef.current = [];
    allChunksRef.current = [];
    setState("idle");
  }, [clearReadAloudSectionOutline]);

  useEffect(() => () => cleanup(), [cleanup]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const speakChunk = useCallback(
    (idx: number) => {
      const chunks = chunksRef.current;
      const gen = speakGenRef.current;

      if (stoppedRef.current || idx >= chunks.length) {
        if (idx >= chunks.length) {
          clearReadAloudSectionOutline();
          let preserveSelection = false;
          if (chunks.length === 1 && allChunksRef.current.length > 1) {
            preserveSelection = suppressWordHighlightRef.current;
            const playedEl = chunks[0]?.el;
            chunksRef.current = [...allChunksRef.current];
            const nextIdx = restoreIndexAfterSingleSection(playedEl, allChunksRef.current);
            idxRef.current = nextIdx;
            setCurrentIdx(nextIdx);
          }
          suppressWordHighlightRef.current = false;
          if (!preserveSelection) {
            globalThis.getSelection()?.removeAllRanges();
          }
          setState("idle");
        }
        return;
      }

      const chunk = chunks[idx];
      if (!chunk) return;
      idxRef.current = idx;
      setCurrentIdx(idx);

      const sectionOnlyMode =
        chunksRef.current.length === 1 && allChunksRef.current.length > 1;
      if (!sectionOnlyMode) {
        clearReadAloudSectionOutline();
        sectionOutlineElRef.current = chunk.el;
        chunk.el.classList.add("read-aloud-chunk-active");
      }

      const segments = splitSpeakSegments(chunk.text, chunk.el);

      const finishChunkAfterLastSegment = () => {
        if (stoppedRef.current || speakGenRef.current !== gen) return;

        if (chunksRef.current.length === 1 && allChunksRef.current.length > 1) {
          clearTimer();
          const preserveSelection = suppressWordHighlightRef.current;
          suppressWordHighlightRef.current = false;
          clearReadAloudSectionOutline();
          const playedEl = chunksRef.current[0]?.el;
          chunksRef.current = [...allChunksRef.current];
          const nextIdx = restoreIndexAfterSingleSection(playedEl, allChunksRef.current);
          idxRef.current = nextIdx;
          setCurrentIdx(nextIdx);
          if (!preserveSelection) {
            globalThis.getSelection()?.removeAllRanges();
          }
          setState("idle");
          return;
        }

        pauseTimerRef.current = setTimeout(() => {
          if (stoppedRef.current || speakGenRef.current !== gen) return;
          speakChunk(idx + 1);
        }, PAUSE_MS);
      };

      const speakSegment = (segIdx: number) => {
        if (stoppedRef.current || speakGenRef.current !== gen) return;
        let i = segIdx;
        while (i < segments.length && !(segments[i]?.text.trim().length)) {
          i += 1;
        }
        if (i >= segments.length) {
          finishChunkAfterLastSegment();
          return;
        }
        const seg = segments[i];
        if (!seg) {
          finishChunkAfterLastSegment();
          return;
        }

        const utt = new SpeechSynthesisUtterance(seg.text);
        utt.rate = 0.95;
        utt.pitch = 1;

        utt.onboundary = (e: SpeechSynthesisEvent) => {
          if (suppressWordHighlightRef.current) return;
          if (e.name === "word") {
            selectWord(chunk, seg.baseOffset + e.charIndex, e.charLength ?? 1);
          }
        };

        utt.onend = () => {
          if (stoppedRef.current || speakGenRef.current !== gen) return;
          if (i + 1 < segments.length) {
            clearTimer();
            pauseTimerRef.current = setTimeout(() => {
              if (stoppedRef.current || speakGenRef.current !== gen) return;
              speakSegment(i + 1);
            }, seg.pauseAfterMs);
            return;
          }
          finishChunkAfterLastSegment();
        };

        utt.onerror = () => {
          if (!stoppedRef.current) cleanup();
        };

        globalThis.speechSynthesis.speak(utt);
      };

      speakSegment(0);
    },
    [cleanup, clearReadAloudSectionOutline],
  );

  const getArticle = () => document.querySelector("[data-read-aloud]");

  const startReading = useCallback(() => {
    const article = getArticle();
    if (!article) return;

    const chunks = buildArticleChunks(article);
    if (chunks.length === 0) return;

    suppressWordHighlightRef.current = false;
    clearReadAloudSectionOutline();
    chunksRef.current = chunks;
    allChunksRef.current = chunks;
    stoppedRef.current = false;
    bumpSpeakGen();
    clearTimer();
    globalThis.speechSynthesis.cancel();
    setCurrentIdx(0);
    speakChunk(0);
    setState("playing");
  }, [speakChunk, clearReadAloudSectionOutline]);

  const goToChunk = useCallback(
    (nextIdx: number) => {
      const chunks = chunksRef.current;
      if (chunks.length === 0) return;
      const clamped = Math.max(0, Math.min(nextIdx, chunks.length - 1));
      suppressWordHighlightRef.current = false;
      clearReadAloudSectionOutline();
      stoppedRef.current = false;
      bumpSpeakGen();
      clearTimer();
      globalThis.speechSynthesis.cancel();
      setCurrentIdx(clamped);
      speakChunk(clamped);
      setState("playing");
    },
    [speakChunk, clearReadAloudSectionOutline],
  );

  /** 4B — full list from DOM; start at selection anchor chunk index, else current index, else 0. */
  const readFromHereToEnd = useCallback(() => {
    const article = getArticle();
    if (!article) return;

    const full = buildArticleChunks(article);
    if (full.length === 0) return;

    const fromSel = chunkIndexFromSelection(full, article);
    let startIdx = 0;
    if (fromSel !== null) {
      startIdx = fromSel;
    } else if (chunksRef.current.length > 0) {
      startIdx = Math.min(idxRef.current, full.length - 1);
    }

    chunksRef.current = full;
    allChunksRef.current = full;
    suppressWordHighlightRef.current = false;
    clearReadAloudSectionOutline();
    stoppedRef.current = false;
    bumpSpeakGen();
    clearTimer();
    globalThis.speechSynthesis.cancel();
    setCurrentIdx(startIdx);
    speakChunk(startIdx);
    setState("playing");
  }, [speakChunk, clearReadAloudSectionOutline]);

  /** 4A — one block only: from text selection, else current chunk, else first chunk of article. */
  const playThisSectionOnly = useCallback(() => {
    const article = getArticle();
    if (!article) return;

    const full = buildArticleChunks(article);
    if (full.length === 0) return;

    allChunksRef.current = full;

    const fromSel = chunkIndexFromSelection(full, article);
    let one: ParaChunk | null = null;
    if (fromSel !== null) {
      one = full[fromSel] ?? null;
    } else if (chunksRef.current.length > 0 && idxRef.current < chunksRef.current.length) {
      const cur = chunksRef.current[idxRef.current];
      const idxInFull = cur ? full.findIndex((c) => c.el === cur.el) : -1;
      one = idxInFull >= 0 ? full[idxInFull] : full[0] ?? null;
    } else {
      one = full[0] ?? null;
    }
    if (!one) return;

    clearReadAloudSectionOutline();
    sectionOutlineElRef.current = one.el;
    one.el.classList.add("read-aloud-section-active");
    suppressWordHighlightRef.current = hasUserTextSelectionInArticle(article);

    chunksRef.current = [one];
    stoppedRef.current = false;
    bumpSpeakGen();
    clearTimer();
    globalThis.speechSynthesis.cancel();
    setCurrentIdx(0);
    speakChunk(0);
    setState("playing");
  }, [speakChunk, clearReadAloudSectionOutline]);

  const toggle = () => {
    if (state === "idle") {
      const saved = chunksRef.current.length;
      if (saved > 0) {
        const lastI = saved - 1;
        if (idxRef.current >= lastI) {
          startReading();
        } else {
          suppressWordHighlightRef.current = false;
          stoppedRef.current = false;
          bumpSpeakGen();
          clearTimer();
          globalThis.speechSynthesis.cancel();
          const start = Math.min(Math.max(0, idxRef.current), lastI);
          setCurrentIdx(start);
          speakChunk(start);
          setState("playing");
        }
      } else {
        startReading();
      }
    } else if (state === "playing") {
      clearTimer();
      globalThis.speechSynthesis.pause();
      setState("paused");
    } else {
      globalThis.speechSynthesis.resume();
      if (!globalThis.speechSynthesis.speaking) speakChunk(idxRef.current);
      setState("playing");
    }
  };

  if (!mounted) return null;
  if (!globalThis.speechSynthesis) return null;

  const nChunks = chunksRef.current.length;
  const hasChunks = nChunks > 0;
  const atFirst = !hasChunks || currentIdx <= 0;
  const atLast = !hasChunks || currentIdx >= nChunks - 1;

  let toggleTitle = "Read aloud";
  if (state === "playing") toggleTitle = "Pause";
  else if (state === "paused") toggleTitle = "Resume";

  let toggleLabel: React.ReactNode = <><Volume2 size={13} /> Read aloud</>;
  if (state === "playing") toggleLabel = <><Pause size={13} /> Pause</>;
  else if (state === "paused") toggleLabel = <><Play size={13} /> Resume</>;

  const iconBtn =
    "cursor-pointer text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1.5 rounded-lg hover:bg-[var(--surface)] border border-transparent hover:border-[var(--border-color)] disabled:opacity-30 disabled:pointer-events-none disabled:cursor-not-allowed";

  return (
    <div className="flex flex-wrap items-center gap-0.5 sm:gap-1" aria-label="Read aloud controls">
      <button
        type="button"
        onClick={toggle}
        title={toggleTitle}
        aria-label={toggleTitle}
        className={`${iconBtn} flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5`}
      >
        {toggleLabel}
      </button>

      <button
        type="button"
        title="Previous section"
        aria-label="Previous section"
        disabled={atFirst}
        onClick={() => goToChunk(currentIdx - 1)}
        className={iconBtn}
      >
        <SkipBack size={13} aria-hidden />
      </button>
      <button
        type="button"
        title="Next section"
        aria-label="Next section"
        disabled={atLast}
        onClick={() => goToChunk(currentIdx + 1)}
        className={iconBtn}
      >
        <SkipForward size={13} aria-hidden />
      </button>

      <button
        type="button"
        title="Read from here: from selected text to end of article, or from current section if already reading"
        aria-label="Read from here to end of article"
        onClick={readFromHereToEnd}
        className={iconBtn}
      >
        <ListVideo size={13} aria-hidden />
      </button>
      <button
        type="button"
        title="Play this section only: selected block, or current section while reading, or first section"
        aria-label="Play this section only"
        onClick={playThisSectionOnly}
        className={iconBtn}
      >
        <BookMarked size={13} aria-hidden />
      </button>

      {state !== "idle" && (
        <button
          type="button"
          onClick={cleanup}
          title="Stop reading"
          aria-label="Stop reading"
          className={iconBtn}
        >
          <VolumeX size={13} aria-hidden />
        </button>
      )}
    </div>
  );
}
