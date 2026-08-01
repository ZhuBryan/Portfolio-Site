export type TagTone = 'teal' | 'amber' | 'blue' | 'purple';

export interface ProjectTag {
  label: string;
  tone: TagTone;
}

/** Headline metric shown on a card — a big accent numeral + a short label. */
export interface ProjectMetric {
  /** The numeral / value, e.g. "94%" or "27k+". */
  value: string;
  /** Short descriptor under the value, e.g. "accuracy". */
  label: string;
}

/** Card surfaced in the modal's 3D depth stack (front-of-deck cycles on click). */
export interface DeckCard {
  /** Short label shown in the small pill at the top of the card. */
  type: string;
  /** Card heading. */
  title: string;
  /** Short body — kept punchy, 1–2 sentences. */
  content: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  mediaType: 'video' | 'photo';
  /** Short blurb shown inside the expanded modal. */
  longDescription?: string;
  /** Card thumbnail URL (16:9). */
  imageUrl?: string;
  /**
   * Optional hover-preview clip for the card. To activate: drop an .mp4 into
   * public/videos/ and set `video: '/videos/<id>.mp4'`. When present the card
   * plays it (muted, looped) on mouseenter and resets on mouseleave. Leave it
   * unset for the current SVG-thumbnail-only behaviour.
   */
  video?: string;
  thumbnailVideoUrl?: string;
  gallery?: string[];
  fullVideoUrl?: string;
  /** YouTube video id for the modal's media slot (mediaType: 'video'). Takes priority over fullVideoUrl. */
  youtubeId?: string;
  accentColor: string;
  /** One-line "exhibit" summary shown on the flagship card. */
  tagline?: string;
  /** Up to three headline metrics rendered as big accent numerals. */
  metrics?: ProjectMetric[];
  tags: ProjectTag[];
  /** Three deck cards rendered as a 3D stack inside the modal. */
  deckCards?: DeckCard[];
  links?: { label: string; href: string }[];
}

export const projects: Project[] = [
  {
    id: 'foldforge',
    name: 'FoldForge',
    description:
      'Differentiable origami engine: hand-derived gradients accurate to ~1e-8, a photo-to-fold pipeline, and a live browser studio. Give it a photo, it figures out how to fold it.',
    longDescription:
      'Give it a photo. It figures out how to fold it. FoldForge is a differentiable computational origami engine: it reads and validates crease patterns, folds them into 3D with a physically accurate rigid-panel simulator, and runs the whole thing backwards, from a target shape, or a photograph, to the crease pattern that folds into it. Built from scratch in NumPy, every gradient hand-derived and checked against finite differences to ~1e-8, including an implicit-function-theorem layer that differentiates a full physics solver at its energy equilibrium through a single linear solve. Feed it a photo shot at an angle and it detects the mirror axis and straightens the fold before folding it into a real, exportable, 3D-printable crease pattern.',
    accentColor: '#ec4899',
    tagline: 'Give it a photo. It figures out the fold.',
    metrics: [
      { value: '1e-8', label: 'gradient accuracy' },
      { value: '8-200×', label: 'better surface fit' },
      { value: '~2MB', label: 'browser studio' },
    ],
    mediaType: 'photo',
    imageUrl: '/images/projects/foldforge.svg',
    gallery: ['/images/projects/foldforge.svg'],
    tags: [
      { label: 'Python', tone: 'blue' },
      { label: 'NumPy/SciPy', tone: 'teal' },
      { label: 'PyTorch', tone: 'purple' },
      { label: 'JAX', tone: 'amber' },
      { label: 'Three.js', tone: 'purple' },
    ],
    deckCards: [
      {
        type: 'Differentiable Core',
        title: 'Analytic Gradients to ~1e-8',
        content:
          'Hand-derived fold kinematics (Jacobians, sparse-Hessian implicit-function layer) differentiate a full rigid-panel physics simulator, verified against finite differences to ~1e-8, no autodiff framework required.',
      },
      {
        type: 'Photo-to-Origami',
        title: '8-200x Better Surface Fit',
        content:
          'A 2D warped-Miura solver jointly optimizes flat crease pattern and folded surface via gradient descent, fed by GrabCut segmentation and MiDaS monocular depth estimation, turning any photo into a real, printable fold.',
      },
      {
        type: 'Live Studio',
        title: 'Fold It in Your Browser',
        content:
          'A dependency-free ~2MB Three.js studio with its own in-browser physics fold solver: drag a photo on, watch it get segmented, depth-estimated, and folded live. No install, no server.',
      },
    ],
  },
  {
    id: 'honeykey',
    name: 'HoneyKey',
    description:
      'Honeypot security system detecting credential abuse, MITRE ATT&CK mapping, AI SOC reports · nwHacks 2026',
    longDescription:
      'A deceptive honeypot service that exposes fake credentials, observes attacker behaviour, and auto-generates SOC-grade incident reports via an LLM. Maps observed TTPs onto MITRE ATT&CK and triages severity. Built end-to-end at nwHacks 2026.',
    accentColor: '#f5a524',
    tagline: 'A trap that writes its own incident report.',
    metrics: [
      { value: 'ATT&CK', label: 'TTP mapping' },
      { value: 'AI', label: 'SOC reports' },
    ],
    mediaType: 'photo',
    imageUrl: '/images/projects/honeykey.svg',
    gallery: ['/images/projects/honeykey.svg'],
    tags: [
      { label: 'FastAPI', tone: 'amber' },
      { label: 'SQLite', tone: 'amber' },
      { label: 'LLM', tone: 'blue' },
      { label: 'Pydantic', tone: 'amber' },
    ],
    deckCards: [
      {
        type: 'Trap Layer',
        title: 'Decoy Credential Vault',
        content:
          'Synthetic API keys and login pairs seeded into deliberate weak spots. Every fetch is logged with full request context.',
      },
      {
        type: 'Detection Logic',
        title: 'MITRE ATT&CK Mapping',
        content:
          'Observed behaviours mapped to TTPs in real time, severity scored, and grouped into attacker campaigns automatically.',
      },
      {
        type: 'SOC Output',
        title: 'AI Incident Reports',
        content:
          'LLM generates analyst-grade incident write-ups with timeline, IOCs, and recommended next actions, ready to forward.',
      },
    ],
  },
  {
    id: 'investher',
    name: 'InvestHER',
    description:
      'Chrome extension reducing impulse purchases 70% with RAG-based AI coaching + voice synthesis · Hack Western 12',
    longDescription:
      'Chrome extension that intercepts checkout flows and runs an in-the-moment coaching conversation, grounded by RAG over the user’s prior financial decisions. ElevenLabs voice synthesis makes the nudge feel human. Reduced impulse purchases by 70% in user testing.',
    accentColor: '#2e7cf6',
    tagline: 'A human voice at the checkout button.',
    metrics: [
      { value: '70%', label: 'fewer impulse buys' },
    ],
    mediaType: 'photo',
    imageUrl: '/images/projects/investher.svg',
    gallery: ['/images/projects/investher.svg'],
    tags: [
      { label: 'React', tone: 'blue' },
      { label: 'Supabase', tone: 'blue' },
      { label: 'Gemini', tone: 'blue' },
      { label: 'TypeScript', tone: 'purple' },
    ],
    deckCards: [
      {
        type: 'Checkout Interceptor',
        title: 'Coaching Flow',
        content:
          'Chrome extension hooks the cart submit, freezes the page, and runs a five-second coaching dialogue grounded in your goals.',
      },
      {
        type: 'Memory Layer',
        title: 'RAG Index',
        content:
          'Past purchases and goals embedded into Supabase pgvector. Gemini retrieves the most relevant moments to argue against impulse.',
      },
      {
        type: 'Voice Synthesis',
        title: 'ElevenLabs Layer',
        content:
          'Coaching reply is spoken in real time so the nudge feels human, not a popup. That’s the part users said actually changed behaviour.',
      },
    ],
  },
  {
    id: 'canopi',
    name: 'Canopi',
    description:
      'Rental intelligence platform with natural-language home search: describe what you want and Gemini finds the fit, live amenity tethers, and a fault-tolerant geospatial API.',
    longDescription:
      'Team project built at Hack Canada 2026. My focus was the AI preference layer and the 3D map experience: a conversational engine where Gemini infers an 8-axis lifestyle profile from plain-English answers and updates a live radar chart in real time, plus the animated amenity tethers and Three.js neighborhood diorama that visualize walkability, transit, and greenery around a selected listing. The wider platform layers that on top of a scraped-and-enriched dataset of 200+ real Canadian rental listings and a fault-tolerant vitality API (3-mirror Overpass failover, server-side caching, in-flight deduplication) that keeps amenity data flowing under load.',
    accentColor: '#22c55e',
    tagline: 'Home search that listens instead of filters.',
    metrics: [
      { value: '200+', label: 'rental listings' },
      { value: '8-axis', label: 'preference engine' },
      { value: '3×', label: 'API failover' },
    ],
    mediaType: 'video',
    youtubeId: 'VEvdZdRp5EU',
    imageUrl: '/images/projects/canopi.svg',
    tags: [
      { label: 'Next.js', tone: 'blue' },
      { label: 'TypeScript', tone: 'purple' },
      { label: 'Mapbox GL', tone: 'teal' },
      { label: 'Gemini', tone: 'blue' },
      { label: 'Three.js', tone: 'purple' },
      { label: 'Supabase', tone: 'teal' },
    ],
    deckCards: [
      {
        type: 'Preference Engine',
        title: 'Natural-Language Home Search',
        content:
          'Describe what you want in plain English, like "quiet, near good food, short commute," and Gemini infers a structured 8-axis lifestyle profile, auto-selecting the listing that fits and snapping the map straight to it. No filters, no dropdowns.',
      },
      {
        type: 'Map Intelligence',
        title: 'Live Amenity Tethers',
        content:
          'Selecting a home draws real-time animated tether lines to nearby cafes, transit, parks, and clinics, pulled live from OpenStreetMap. Each tether opens into a card with walk time, rating, and distance.',
      },
      {
        type: 'Reliability',
        title: '3-Mirror Failover',
        content:
          'A fault-tolerant vitality API with 3-mirror Overpass failover, 5-minute server-side caching, and in-flight request deduplication, built to keep live amenity data flowing even when the primary source stalls in dense downtown areas.',
      },
    ],
  },
  {
    id: 'runbook',
    name: 'RunBook',
    description:
      'AI onboarding copilot: reads a product’s docs and codebase, then guides users through real in-app steps with grounded chat, next-action inference, and live UI highlighting.',
    longDescription:
      'Led the backend/AI implementation for RunBook, an embeddable onboarding copilot that turns a product’s own documentation into guided, step-by-step workflows instead of a static help page. Built the core chat API and its context-composition pipeline (combining page state, hovered-feature metadata, and project docs into a single grounded prompt), plus the retrieval flow that keeps answers tied to real source material. Went past search-only Q&A by implementing next-step inference and structured UI-action payloads, so the assistant can trigger a highlight or start a tour rather than just describe one. Also hardened the system for the messiness of real demos: fallback logic for incomplete model output, deterministic error messaging, and reliability patches for event timing and highlight recovery across pages that hadn’t fully rendered yet. Validated the whole pipeline across two structurally different demo products, a workflow SaaS surface and an e-commerce ops surface, spanning 3 repositories, proving the onboarding engine generalizes rather than being hand-tuned to one UI.',
    accentColor: '#6366f1',
    tagline: 'Turns a product’s own docs into a guided tour.',
    metrics: [
      { value: '2', label: 'demo products validated' },
      { value: '3', label: 'repos spanned' },
    ],
    mediaType: 'video',
    youtubeId: 'Bc27sklDOag',
    imageUrl: '/images/projects/runbook.svg',
    tags: [
      { label: 'Next.js', tone: 'blue' },
      { label: 'FastAPI', tone: 'amber' },
      { label: 'LLM Orchestration', tone: 'purple' },
      { label: 'RAG', tone: 'blue' },
      { label: 'Event-Driven Architecture', tone: 'teal' },
      { label: 'TypeScript', tone: 'purple' },
    ],
    deckCards: [
      {
        type: 'AI Core',
        title: 'Context-Grounded Chat API',
        content:
          'A retrieval-aware chat endpoint that fuses page state, hovered-feature metadata, and a project’s own docs into one coherent prompt. Answers are grounded in real source material, not hallucinated, and every response includes numbered steps plus a UI-action payload.',
      },
      {
        type: 'Execution Layer',
        title: 'Action-First Onboarding',
        content:
          'Goes beyond Q&A: the assistant infers the user’s next step from live app state and emits structured UI actions (trigger a highlight, start a tour, focus an element) so guidance is something the frontend executes, not just displays.',
      },
      {
        type: 'Reliability',
        title: 'Cross-Site Runtime Hardening',
        content:
          'An embeddable widget runtime with fallback selector logic, popup-placement recovery, and stale-cache handling, validated across two structurally different demo products so guidance holds up on UIs it wasn’t built for.',
      },
    ],
  },
];
