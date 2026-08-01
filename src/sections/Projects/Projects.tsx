import { useState } from 'react';
import { projects, type Project } from '../../data/projects';
import CoralCard from './CoralCard';
import FlagshipCard from './FlagshipCard';
import ProjectModal from './ProjectModal';
import Coral from '../../components/Coral/Coral';
import ReefPeeker from '../../components/ReefPeeker/ReefPeeker';
import SwimBy from '../../components/SwimBy/SwimBy';
import JellyBloom from '../../components/JellyBloom/JellyBloom';
import './Projects.css';

// (coral reef row + ambient schools + caustic shimmer)
export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);

  const [flagship, ...rest] = projects;

  return (
    <section className="projects-section" id="projects">
      {/* subtle drifting light + a couple of ambient schools drifting past the
          reef (the interactive flocking canvas lives in Experience). */}
      <div className="caustics" aria-hidden="true" />
      <SwimBy top="16%" duration={38} tint="rgba(6, 44, 60, 0.22)" scale={0.9} />
      <SwimBy top="52%" duration={44} reverse delay={-20} tint="rgba(6, 44, 60, 0.16)" scale={0.85} species="roundfish" />
      <JellyBloom left="82%" top="10%" tint="rgba(6, 44, 60, 0.2)" scale={0.85} />
      {/* the shy octopus rises from behind the coral and watches the cursor */}
      <ReefPeeker />
      <Coral />

      <div className="section-inner">
        <p className="section-label">Projects</p>
        <h2 className="section-title">Things I&rsquo;ve built</h2>

        {flagship && (
          <div className="reef-flagship">
            <FlagshipCard project={flagship} onSelect={setSelected} />
          </div>
        )}

        <div className="reef-grid">
          {rest.map((p, i) => (
            <CoralCard key={p.id} project={p} index={i} onSelect={setSelected} />
          ))}
        </div>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
