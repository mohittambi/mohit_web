import { careerArtifactBySlug } from "./career";
import { narrativeAppendixBySlug } from "./narrative";
import { blogPosts } from "./posts";
import { sortBlogPostsByPublishPriority } from "./publish-order";
import type { BlogPost, BlogSection } from "./types";

function withNarrativeAppendix(post: BlogPost): BlogPost {
  const appendix = narrativeAppendixBySlug[post.slug];
  if (!appendix) return post;
  const [first, ...rest] = post.sections;
  if (!first) return post;

  const narrativeBlocks: BlogSection[] = [
    {
      kind: "war_story",
      context: appendix.warStory.context,
      broke: appendix.warStory.broke,
      wrong_first: appendix.warStory.wrong_first,
      solution: appendix.warStory.solution,
      tradeoff: appendix.warStory.tradeoff,
    },
    ...rest,
    { kind: "what_not", paragraphs: appendix.whatNot },
    {
      kind: "numbers_note",
      label: appendix.numbersLabel,
      paragraphs: appendix.numbers,
    },
    {
      kind: "read_next",
      intro: appendix.readNextIntro,
      items: appendix.readNextItems,
    },
  ];

  return { ...post, sections: [first, ...narrativeBlocks] };
}

function withCareerLayer(post: BlogPost): BlogPost {
  const c = careerArtifactBySlug[post.slug];
  if (!c) return post;
  const careerBlocks: BlogSection[] = [
    { kind: "diagram_brief", title: c.diagramBrief.title, elements: c.diagramBrief.elements },
    {
      kind: "cto_from_scratch",
      week1: c.ctoFromScratch.week1,
      month1: c.ctoFromScratch.month1,
      scale: c.ctoFromScratch.scale,
    },
    { kind: "interview_prep", interview30: c.interview30Sec, cto1min: c.cto1Min },
    { kind: "signal_pack", hook: c.opinionHook, visual: c.strongVisual, linkedInThread: c.linkedInThread },
  ];
  return { ...post, sections: [...post.sections, ...careerBlocks] };
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return undefined;
  return withCareerLayer(withNarrativeAppendix(post));
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((p) => p.slug);
}

export function getBlogPostsForListing(): BlogPost[] {
  return sortBlogPostsByPublishPriority(blogPosts);
}
