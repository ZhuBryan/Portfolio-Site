export type SkillCategory = 'lang' | 'ml' | 'tools';

export interface Skill {
  name: string;
  category: SkillCategory;
}

export const CATEGORY_COLOR: Record<SkillCategory, string> = {
  lang: '#1aaf7a',
  ml: '#c8a830',
  tools: '#6080c8',
};

export const CATEGORY_LABEL: Record<SkillCategory, string> = {
  lang: 'Languages & Frameworks',
  ml: 'ML & AI',
  tools: 'Tools & Platforms',
};

export const skills: Skill[] = [
  { name: 'Python', category: 'lang' },
  { name: 'PyTorch', category: 'lang' },
  { name: 'TypeScript', category: 'lang' },
  { name: 'React', category: 'lang' },
  { name: 'FastAPI', category: 'lang' },
  { name: 'scikit-learn', category: 'ml' },
  { name: 'ONNX', category: 'ml' },
  { name: 'Node.js', category: 'lang' },
  { name: 'SQL / SQLite', category: 'ml' },
  { name: 'C / C++', category: 'lang' },
  { name: 'Supabase', category: 'tools' },
  { name: 'MongoDB', category: 'tools' },
  { name: 'Transfer Learning', category: 'ml' },
  { name: 'Grad-CAM', category: 'ml' },
  { name: 'Git / GitHub', category: 'lang' },
  { name: 'REST APIs', category: 'tools' },
];
