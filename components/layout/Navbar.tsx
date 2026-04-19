"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Logo";

const links = [
  { label: "About", href: "/#about" },
  { label: "Work", href: "/#work" },
  { label: "Writing", href: "/#writing" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border-color)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="Mohit Tambi — home">
          <Logo size={32} />
          <span className="font-semibold text-sm text-[var(--text)] hidden sm:block">Mohit Tambi</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            l.href.startsWith("/#") ? (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {l.label}
              </Link>
            )
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/#contact"
            className="hidden md:inline-flex items-center h-9 px-4 rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Schedule a Call
          </a>
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)]"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg)] px-6 py-4 flex flex-col gap-4">
          {links.map((l) =>
            l.href.startsWith("/#") ? (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {l.label}
              </Link>
            )
          )}
          <a
            href="/#contact"
            onClick={() => setOpen(false)}
            className="inline-flex items-center h-9 px-4 rounded-md text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors w-fit"
          >
            Schedule a Call
          </a>
        </div>
      )}
    </header>
  );
}
