"use client";
import { useEffect } from "react";

const BLOCKED_KEYS: Array<(e: KeyboardEvent) => boolean> = [
  (e) => e.key === "F12",
  (e) => (e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase()),
  (e) => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u",
  (e) => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s",
  (e) => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p",
  (e) => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c",
  (e) => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x",
  (e) => (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a",
];

export function CopyGuard() {
  useEffect(() => {
    const blockKey = (e: KeyboardEvent) => {
      if (BLOCKED_KEYS.some((fn) => fn(e))) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const blockContext = (e: MouseEvent) => e.preventDefault();
    const blockCopy = (e: ClipboardEvent) => e.preventDefault();
    const blockDrag = (e: DragEvent) => e.preventDefault();

    document.addEventListener("keydown", blockKey, true);
    document.addEventListener("contextmenu", blockContext, true);
    document.addEventListener("copy", blockCopy, true);
    document.addEventListener("cut", blockCopy, true);
    document.addEventListener("dragstart", blockDrag, true);

    return () => {
      document.removeEventListener("keydown", blockKey, true);
      document.removeEventListener("contextmenu", blockContext, true);
      document.removeEventListener("copy", blockCopy, true);
      document.removeEventListener("cut", blockCopy, true);
      document.removeEventListener("dragstart", blockDrag, true);
    };
  }, []);

  return null;
}
