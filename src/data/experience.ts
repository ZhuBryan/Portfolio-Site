export interface ExperienceEntry {
  role: string;
  /** Org line, formatted as "Org · Date range" (the rendered timeline-org row). */
  org: string;
  dotColor: string;
  /** Bullets may include <stat>…</stat> tokens that render as stat pills. */
  bullets: string[];
}

/**
 * Inline stat-pill marker — wrap stats in <stat>…</stat> inside a bullet
 * string and the renderer will swap it for a styled pill.
 */
export const STAT_OPEN = '<stat>';
export const STAT_CLOSE = '</stat>';

export const experience: ExperienceEntry[] = [
  {
    role: 'Software Project Lead',
    org: 'Waterloo Reality Labs · Sep 2025 – Present',
    dotColor: '#1aaf7a',
    bullets: [
      'Reduced inference overhead <stat>75%</stat> upgrading AR/VR hand gesture system on Meta Quest',
      'Achieved <stat>99% accuracy</stat> across 1,246 temporal samples with Conv2D PyTorch model',
      'Improved few-shot classification from <stat>71% → 92%</stat> using Siamese network with triplet loss',
    ],
  },
  {
    role: 'Content Strategist — World Finalist',
    org: 'Wharton Global Investment Competition · Nov 2023 – Apr 2024',
    dotColor: '#c8a830',
    bullets: [
      'Placed <stat>Top 11 / 4000+ teams</stat> worldwide, first-ever finalist from Alberta',
      'Delivered <stat>7.11%</stat> avg monthly return via mean-variance optimization',
    ],
  },
];
