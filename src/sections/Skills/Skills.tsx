import { type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { skills, CATEGORY_COLOR, CATEGORY_LABEL, type SkillCategory } from '../../data/skills';
import SwimBy from '../../components/SwimBy/SwimBy';
import JellyBloom from '../../components/JellyBloom/JellyBloom';
import DriftLayer from '../../components/DriftLayer/DriftLayer';
import './Skills.css';

const CLUSTER_ORDER: SkillCategory[] = ['lang', 'ml', 'tools'];

type BubbleStyle = CSSProperties & {
  '--bubble-color'?: string;
  '--bob-delay'?: string;
  '--bob-dur'?: string;
  '--bob-rot'?: string;
};

export default function Skills() {
  return (
    <section className="skills-section" id="skills">
      <div className="caustics" aria-hidden="true" />
      <DriftLayer />
      <SwimBy top="70%" duration={42} tint="rgba(220, 250, 255, 0.12)" scale={0.7} species="roundfish" />
      <SwimBy top="40%" duration={36} reverse delay={-15} tint="rgba(220, 250, 255, 0.1)" scale={0.6} />
      <JellyBloom left="12%" top="9%" tint="rgba(220, 250, 255, 0.22)" scale={0.75} />

      <div className="section-inner">
        <p className="section-label">Skills</p>
        <h2 className="section-title">What I build with</h2>

        <div className="tidepool">
          {CLUSTER_ORDER.map((cat, ci) => {
            const items = skills.filter((s) => s.category === cat);
            return (
              <motion.div
                className="tidepool-cluster"
                key={cat}
                style={{ ['--cluster-color' as string]: CATEGORY_COLOR[cat] }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.6, delay: ci * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                <h3 className="tidepool-cluster__label">
                  <span className="tidepool-cluster__ring" aria-hidden="true" />
                  {CATEGORY_LABEL[cat]}
                </h3>
                <div className="tidepool-cluster__bubbles">
                  {items.map((s, i) => {
                    const style: BubbleStyle = {
                      '--bubble-color': CATEGORY_COLOR[cat],
                      '--bob-delay': `${(i * 0.7).toFixed(2)}s`,
                      '--bob-dur': `${(5.5 + (i % 4) * 0.9).toFixed(2)}s`,
                      '--bob-rot': `${i % 2 === 0 ? 1.6 : -1.6}deg`,
                    };
                    return (
                      <span className="skill-bubble" key={s.name} style={style}>
                        <span className="skill-bubble__dot" aria-hidden="true" />
                        <span className="skill-bubble__name">{s.name}</span>
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="skills-legend">
          {CLUSTER_ORDER.map((cat) => (
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
