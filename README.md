# Bryan Zhu — Portfolio

Personal portfolio site built around a "deep-sea / scuba diving" metaphor.
The hero starts above water; as you scroll, a diving-mask transition takes you
underwater and the rest of the site lives in a deep-navy reef.

## Stack

- **Vite + React + TypeScript** — fast dev loop, type safety, zero-config build
- **Framer Motion** — for the project-modal transitions and (incoming) the
  scroll-driven mask animation
- **Plain CSS** with design-token CSS variables in `src/styles/global.css`
- **Vercel** for hosting (config in `vercel.json`)
- **GitHub Actions** runs `tsc` + `vite build` on every push/PR

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into ./dist
npm run preview  # serve the built site locally
```

## Project structure

```
src/
├── main.tsx              entry, mounts <App />
├── App.tsx               composes all sections
├── styles/global.css     design tokens (CSS variables) + base styles
├── components/           reusable atoms (BubbleParticles, DepthBar, SectionLabel)
├── svg/                  illustration components (Turtle, ScubaMask, WaterSurface, corals, …)
├── data/                 content data (projects, experience, skills)
└── sections/
    ├── Hero/             above-water intro
    ├── MaskTransition/   the "putting on the mask" moment
    ├── About/            personality blurb + turtle mascot
    ├── Projects/         coral cards (signature section) + expand-on-click modal
    ├── Experience/       vertical timeline
    ├── Skills/           color-coded skill grid
    └── Contact/          resurfacing CTA + links
```

## Adding a project

1. Drop a new `<NameCoral />` component in `src/svg/corals/index.tsx` —
   use the existing 120×64 viewBox and anchor the trunk at `(60, 64)`.
2. Append a new entry to `projects` in `src/data/projects.ts`, referencing
   the coral component and picking an accent color.

Tag tones available: `teal | amber | blue | purple`.

## Adding experience

Edit `src/data/experience.ts`. Wrap inline stats in `<stat>…</stat>` and the
timeline renderer will turn them into stat pills automatically.

## What's still to build

- [ ] Full-viewport scroll-driven mask transition (hooks in `MaskTransition.tsx`)
- [ ] Parallax background coral silhouettes in underwater sections
- [ ] Cursor-following turtle behaviour in About
- [ ] Drop the real resume PDF at `public/Bryan_Zhu_Resume.pdf`
- [ ] Wire `message in a bottle` button to a personal note modal

## Deployment

The repo is set up for Vercel out of the box: import the repo at
[vercel.com](https://vercel.com) → it will auto-detect Vite, use the settings
from `vercel.json`, and deploy on every push to `main`.
