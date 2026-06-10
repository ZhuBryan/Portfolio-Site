import { motion } from 'framer-motion';
import { skills, CATEGORY_COLOR, CATEGORY_LABEL, type SkillCategory } from '../../data/skills';
import './Skills.css';

const LEGEND_ORDER: SkillCategory[] = ['lang', 'ml', 'tools'];

export default function Skills() {
  return (
    <section className="skills-section" id="skills">
      <div className="section-inner">
        <p className="section-label">The Toolkit</p>
        <h2 className="section-title">Skills in the tank</h2>

        <div className="skills-grid">
          {skills.map((s, i) => (
            <motion.div
              className="skill-chip"
              key={s.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: (i % 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="skill-dot" style={{ background: CATEGORY_COLOR[s.category] }} />
              <span className="skill-name">{s.name}</span>
            </motion.div>
          ))}
        </div>

        <div className="skills-legend">
          {LEGEND_ORDER.map((cat) => (
            <span key={cat} className="skills-legend__item">
              <span className="legend-dot" style={{ background: CATEGORY_COLOR[cat] }} />
              {CATEGORY_LABEL[cat]}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
