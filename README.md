# Portfolio

My personal site. One page, ocean theme, the water gets deeper as you scroll.

There are a few small creatures living in it: a turtle that follows your cursor
(click for a barrel roll), a school of fish in the Experience section that you
can feed by clicking the water (move the mouse too fast and you'll spook them),
an octopus that peeks over the coral and watches you browse, and a crab in the
footer that does not want to be caught. All of them shut off under
prefers-reduced-motion and on touch devices.

## Stack

React 18, Vite, TypeScript (strict), framer-motion, plain CSS with variables in
`src/styles/global.css`. The octopus is a GLB rendered with react-three-fiber
in a lazy chunk, so three.js never loads unless the model does. Everything else
is SVG and canvas.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type check + build into ./dist
npm run preview
```

## Editing content

All the content lives in `src/data/`:

- `projects.ts` for project cards. Each entry needs an id, name, description,
  accentColor and tags. Thumbnails are 16:9 SVGs in `public/images/projects/`.
  Optional: set `video: '/videos/<id>.mp4'` (file goes in `public/videos/`)
  and the card plays a muted preview on hover. The first project in the array
  renders as the big flagship card.
- `experience.ts` for the timeline. Wrap numbers in `<stat>...</stat>` inside
  bullets and they render as pills.
- `skills.ts` for the skill clusters, categorized as lang / ml / tools.

Photo goes at `public/images/portrait.jpg`, resume at
`public/Bryan_Zhu_Resume.pdf`.

## Deploying

Cloudflare Workers, static assets from `dist`. Config is in `wrangler.jsonc`.
Build command `npm run build`, deploy command `npx wrangler deploy`.

## Credits

Octopus model: "Octopus" by jeremy on poly.pizza, CC-BY 3.0.
