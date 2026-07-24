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
    id: 'vantage',
    name: 'VANTAGE',
    description:
      'Satellite audit platform: 94% accuracy detecting deforestation via fine-tuned ResNet-18 on 27k+ images',
    longDescription:
      'Built an end-to-end environmental audit platform that ingests satellite tiles, classifies land-use change with a fine-tuned ResNet-18 (94% accuracy on 27k+ EuroSAT images), and surfaces explainable per-pixel attribution via Grad-CAM. Real-time API + dashboard.',
    accentColor: '#0ea5a0',
    tagline: 'Seeing the forest change from orbit.',
    metrics: [
      { value: '94%', label: 'accuracy' },
      { value: '27k+', label: 'satellite tiles' },
      { value: '10', label: 'land-use classes' },
    ],
    mediaType: 'photo',
    imageUrl: '/images/projects/vantage.svg',
    gallery: ['/images/projects/vantage.svg'],
    tags: [
      { label: 'PyTorch', tone: 'teal' },
      { label: 'FastAPI', tone: 'teal' },
      { label: 'Grad-CAM', tone: 'amber' },
      { label: 'Reflex', tone: 'teal' },
    ],
    deckCards: [
      {
        type: 'VANTAGE Core',
        title: 'Architecture',
        content:
          'ResNet-18 backbone fine-tuned on EuroSAT, served from a FastAPI inference layer with a Reflex dashboard on top.',
      },
      {
        type: 'EuroSAT Training Set',
        title: 'Dataset Metrics',
        content:
          '27k+ multispectral satellite tiles, 10 land-use classes, stratified split, 94% top-1 accuracy on the held-out set.',
      },
      {
        type: 'Visual Interpretability',
        title: 'Grad-CAM Heatmaps',
        content:
          'Per-pixel attribution overlays show where the model is locking onto deforestation signatures: auditable, not a black box.',
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
    id: 'instrument-classifier',
    name: 'Instrument Classifier',
    description:
      'CNN achieving 98% accuracy on mel spectrograms: 4-layer architecture, Adam optimizer, 2000+ audio samples',
    longDescription:
      'Trained a four-layer convolutional network on mel-spectrogram representations of 2000+ audio samples to classify musical instruments with 98% test accuracy. Used Adam, data augmentation, and careful regularization to keep generalization tight.',
    accentColor: '#8b5cf6',
    tagline: 'Naming instruments from a picture of sound.',
    metrics: [
      { value: '98%', label: 'test accuracy' },
      { value: '2k+', label: 'audio samples' },
    ],
    mediaType: 'photo',
    imageUrl: '/images/projects/instrument-classifier.svg',
    gallery: ['/images/projects/instrument-classifier.svg'],
    tags: [
      { label: 'PyTorch', tone: 'purple' },
      { label: 'torchaudio', tone: 'purple' },
      { label: 'CNN', tone: 'purple' },
    ],
    deckCards: [
      {
        type: 'Audio Pipeline',
        title: 'Mel Spectrogram',
        content:
          'Raw WAV → resample → 128-bin mel spectrogram, normalized per-clip. Augmented with time/frequency masking on the fly.',
      },
      {
        type: 'Network',
        title: '4-layer CNN',
        content:
          'Four conv blocks (32→64→128→256), batch norm + ReLU + max-pool, single dense head. Trained with Adam + cosine schedule.',
      },
      {
        type: 'Result',
        title: '98% Test Accuracy',
        content:
          '2000+ samples across instrument classes. Top-1 holds at 98% with no obvious confusion clusters on the per-class matrix.',
      },
    ],
  },
  {
    id: 'boxbots-skeeball',
    name: 'BoxBots Skee-ball',
    description:
      'Multi-Arduino I²C robotic skee-ball: 99%+ communication reliability, Best Game Award',
    longDescription:
      'Designed a distributed embedded system where multiple Arduinos coordinate over I²C to run a robotic skee-ball arcade game. Achieved 99%+ inter-board communication reliability under load. Won Best Game Award.',
    accentColor: '#ff6f61',
    tagline: 'Three Arduinos, one very competitive arcade game.',
    metrics: [
      { value: '99%+', label: 'link reliability' },
      { value: 'Best', label: 'game award' },
    ],
    mediaType: 'photo',
    imageUrl: '/images/projects/boxbots-skeeball.svg',
    gallery: ['/images/projects/boxbots-skeeball.svg'],
    tags: [
      { label: 'Arduino', tone: 'teal' },
      { label: 'C++', tone: 'teal' },
      { label: 'I²C', tone: 'amber' },
    ],
    deckCards: [
      {
        type: 'Bus Topology',
        title: 'Multi-Master I²C',
        content:
          'Three Arduinos on a shared bus: controller orchestrates, scoring slave reports ball detections, motor slave drives launcher.',
      },
      {
        type: 'Reliability',
        title: '99%+ Frame Delivery',
        content:
          'Pull-up tuning, ACK retry, and checksum framing pushed message loss below 1% across a full demo session.',
      },
      {
        type: 'Game Loop',
        title: 'State Machine',
        content:
          'Idle → Ready → Roll → Score → Reset, with debounced sensor reads. Won Best Game Award at the showcase.',
      },
    ],
  },
];
