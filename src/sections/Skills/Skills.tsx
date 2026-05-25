import SectionLabel from '../../components/SectionLabel';
import ParallaxCoralBackdrop from '../../components/ParallaxCoralBackdrop';
import { skills, CATEGORY_COLOR, CATEGORY_LABEL, type SkillCategory } from '../../data/skills';
import './Skills.css';

const LEGEND_ORDER: SkillCategory[] = ['lang', 'ml', 'tools'];

export default function Skills() {
  return (
    <section className="skills-section" id="skills">
      <ParallaxCoralBackdrop tone="teal" density="quiet" />
      <SectionLabel>Skills</SectionLabel>
      <div className="skills-grid">
        {skills.map((s) => (
          <div className="skill-chip" key={s.name}>
            <div className="skill-dot" style={{ background: CATEGORY_COLOR[s.category] }} />
            <span className="skill-name">{s.name}</span>
          </div>
        ))}
      </div>
      <div className="skills-legend">
        {LEGEND_ORDER.map((cat) => (
          <span key={cat}>
            <span className="legend-dot" style={{ background: CATEGORY_COLOR[cat] }} />
            {CATEGORY_LABEL[cat]}
          </span>
        ))}
      </div>
    </section>
  );
}
