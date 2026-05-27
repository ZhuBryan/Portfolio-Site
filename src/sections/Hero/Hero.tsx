import SectionLabel from '../../components/SectionLabel';

import './Hero.css';

export default function Hero() {
  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-stars" />
      <SectionLabel>Portfolio</SectionLabel>
      <h1 className="hero-name">Bryan Zhu</h1>
      <p className="hero-tagline">CS @ Waterloo · AI / ML · Finance · Builder</p>
      <div className="hero-cta-row">
        <a className="btn-primary" href="/Bryan_Zhu_Resume.pdf" download>
          Download Resume
        </a>
        <button className="btn-ghost" type="button" onClick={scrollToProjects}>
          View Projects ↓
        </button>
      </div>
    </section>
  );
}
