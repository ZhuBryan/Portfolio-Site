import Navbar from './components/Navbar/Navbar';
import CursorTurtle from './components/CursorTurtle/CursorTurtle';
import PlanktonTrail from './components/PlanktonTrail/PlanktonTrail';
import Hero from './sections/Hero/Hero';
import Experience from './sections/Experience/Experience';
import Projects from './sections/Projects/Projects';
import Skills from './sections/Skills/Skills';
import Contact from './sections/Contact/Contact';

export default function App() {
  return (
    <div className="port-wrap">
      <Navbar />
      <CursorTurtle />
      <Hero />
      <Experience />
      <Projects />
      <Skills />
      <Contact />
      {/* one fixed, full-viewport plankton canvas — spawns only over the deep
          sections (Skills ∪ Contact) so motes drift seamlessly across the seam
          instead of being cut/restarted per section */}
      <PlanktonTrail />
    </div>
  );
}
