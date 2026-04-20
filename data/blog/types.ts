/** Depth signal for listing + header (long sagas vs shorter tips). */
export type BlogDifficulty = "Foundational" | "Intermediate" | "Deep dive";

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
  | { kind: "signal_pack"; hook: string; visual: string; linkedInThread: string[] }
  | {
      kind: "further_reading";
      intro: string;
      items: ReadonlyArray<{ title: string; href: string; context: string }>;
    }
  | {
      kind: "cost_note";
      label?: string;
      paragraphs: string[];
      formula?: string;
    }
  | {
      kind: "region_note";
      region?: string;
      paragraphs: string[];
    }
  | {
      kind: "cost_table";
      title: string;
      headers: string[];
      rows: string[][];
      note?: string;
    }
  | {
      kind: "code_block";
      language: string;
      code: string;
      title?: string;
    }
  | {
      kind: "prompt_example";
      title?: string;
      before?: { label?: string; code: string; language?: string };
      after: { label?: string; code: string; language?: string };
      note?: string;
    };

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: string;
  /** Depth / commitment for readers scanning the index. */
  difficulty: BlogDifficulty;
  tags: string[];
  sections: BlogSection[];
}
