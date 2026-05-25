import { useState } from 'react';
import SectionLabel from '../../components/SectionLabel';
import DepthBar from '../../components/DepthBar';
import ParallaxCoralBackdrop from '../../components/ParallaxCoralBackdrop';
import BioluminescentFloor from '../../components/BioluminescentFloor/BioluminescentFloor';
import SandFloor from '../../svg/SandFloor';
import CoralFilterDefs from '../../svg/corals/CoralFilterDefs';
import { projects, type Project } from '../../data/projects';
import CoralCard from './CoralCard';
import ProjectModal from './ProjectModal';
import './Projects.css';

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section className="projects-section" id="projects">
      {/* Shared SVG filter graph for all corals (turbulence + displacement
          + glow). Rendered once; every coral references it by id. */}
      <CoralFilterDefs />

      {/* Ambient backdrops — cursor-reactive bioluminescent glow fills the
          full section, with parallax coral silhouettes drifting on top. */}
      <BioluminescentFloor />
      <ParallaxCoralBackdrop tone="blue" />

      <DepthBar ticks={4} />
      <SectionLabel>Projects</SectionLabel>
      <div className="projects-subnote">move your cursor — the reef glows back</div>

      <div className="reef-floor">
        {projects.map((p, i) => (
          <CoralCard key={p.id} project={p} index={i} onSelect={setSelected} />
        ))}
      </div>

      <div className="sand-base">
        <SandFloor />
        <span className="sand-note">
          ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
        </span>
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
