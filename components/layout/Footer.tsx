import { BookOpen } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] py-10 mt-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} Mohit Tambi
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/mohittambi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label="GitHub"
          >
            <GithubIcon size={18} />
          </a>
          <a
            href="https://www.linkedin.com/in/mohit-tambi/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label="LinkedIn"
          >
            <LinkedinIcon size={18} />
          </a>
          <a
            href="https://medium.com/@er.mohittambi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            aria-label="Medium"
          >
            <BookOpen size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
