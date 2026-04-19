export interface NarrativeAppendix {
  warStory: {
    context: string;
    broke: string;
    wrong_first: string;
    solution: string;
    tradeoff: string;
  };
  whatNot: string[];
  numbers: string[];
  numbersLabel?: string;
  readNextIntro: string;
  readNextItems: { slug: string; title: string; why: string }[];
}
