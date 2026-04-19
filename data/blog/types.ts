export type BlogSection =
  | { kind: "h2"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | {
      kind: "war_story";
      context: string;
      broke: string;
      wrong_first: string;
      solution: string;
      tradeoff: string;
    }
  | { kind: "what_not"; paragraphs: string[] }
  | { kind: "numbers_note"; label?: string; paragraphs: string[] }
  | {
      kind: "read_next";
      intro: string;
      items: { slug: string; title: string; why: string }[];
    }
  | { kind: "diagram_brief"; title: string; elements: string[] }
  | { kind: "cto_from_scratch"; week1: string[]; month1: string[]; scale: string[] }
  | { kind: "interview_prep"; interview30: string; cto1min: string }
  | { kind: "signal_pack"; hook: string; visual: string; linkedInThread: string[] };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: string;
  tags: string[];
  sections: BlogSection[];
}
