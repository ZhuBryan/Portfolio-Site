import Hero from './sections/Hero/Hero';
import MaskTransition from './sections/MaskTransition/MaskTransition';
import About from './sections/About/About';
import Projects from './sections/Projects/Projects';
import Experience from './sections/Experience/Experience';
import Skills from './sections/Skills/Skills';
import Contact from './sections/Contact/Contact';

export default function App() {
  return (
    <div className="port-wrap">
      <Hero />
      <MaskTransition />
      <About />
      <Projects />
      <Experience />
      <Skills />
      <Contact />
    </div>
  );
}
