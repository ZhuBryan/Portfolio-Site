import { useState } from 'react';
import { projects, type Project } from '../../data/projects';
import CoralCard from './CoralCard';
import ProjectModal from './ProjectModal';
import './Projects.css';

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section className="projects-section" id="projects">
      {/* drifting coral silhouettes along the bottom edge */}
      <div className="projects-coral-silhouette" aria-hidden="true" />

      <div className="section-inner">
        <p className="section-label">Act IV · The Coral Reef</p>
        <h2 className="section-title">Projects growing on the reef</h2>
        <p className="section-sub">
          Five builds I&rsquo;m proud of — machine learning, security, fintech, and one very
          competitive skee-ball robot. Click any card for the full story.
        </p>

        <div className="reef-grid">
          {projects.map((p, i) => (
            <CoralCard key={p.id} project={p} index={i} onSelect={setSelected} />
          ))}
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
