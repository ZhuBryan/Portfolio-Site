import { motion } from 'framer-motion';
import DriftLayer from '../../components/DriftLayer/DriftLayer';
import SandCrab from '../../components/SandCrab/SandCrab';
import './Contact.css';

const MailIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
    <path d="M3.5 7l8.5 6 8.5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LinkedInIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.25 8.25h4.5V23H.25V8.25zM8.5 8.25h4.31v2.02h.06c.6-1.14 2.07-2.34 4.26-2.34 4.55 0 5.39 3 5.39 6.89V23h-4.5v-7.1c0-1.69-.03-3.87-2.36-3.87-2.36 0-2.72 1.84-2.72 3.75V23H8.5V8.25z" />
  </svg>
);

const GitHubIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 015.78 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.26 5.66.41.36.78 1.05.78 2.13v3.16c0 .31.2.66.8.55A11.52 11.52 0 0023.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

export default function Contact() {
  const backToSurface = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="contact-section" id="contact">
      <DriftLayer />
      {/* a small crab that scuttles along the sand away from the cursor
          (desktop/hover/no-reduced-motion; canvas-free, pointer-events none) */}
      <SandCrab sectionSelector="#contact" />
      <div className="section-inner contact-inner">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label contact-label">Get in touch</p>
          <h2 className="contact-tagline">
            Always up for a <em>good problem</em>.
          </h2>
          <p className="contact-sub">
            Internships, collaborations, or a conversation about ML. My inbox is open.
          </p>

          <div className="contact-links">
            <a className="contact-link contact-link--primary" href="mailto:b88zhu@uwaterloo.ca">
              {MailIcon}
              <span>b88zhu@uwaterloo.ca</span>
            </a>
            <a
              className="contact-link"
              href="https://linkedin.com/in/bryan-zhu101"
              target="_blank"
              rel="noopener noreferrer"
            >
              {LinkedInIcon}
              <span>LinkedIn</span>
            </a>
            <a
              className="contact-link"
              href="https://github.com/ZhuBryan"
              target="_blank"
              rel="noopener noreferrer"
            >
              {GitHubIcon}
              <span>GitHub</span>
            </a>
          </div>

          <button className="contact-surface" type="button" onClick={backToSurface}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 20V6m0 0l-6 6m6-6l6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            back to the surface
          </button>
        </motion.div>
      </div>

      <div className="contact-floor" aria-hidden="true">
        <svg className="contact-starfish" viewBox="0 0 64 64" width="46" height="46">
          <path
            d="M32 4l7.2 16.2 17.6 1.8-13.2 11.9 3.8 17.3L32 42.4 16.6 51.2l3.8-17.3L7.2 22 24.8 20.2z"
            fill="#ffb09a"
            stroke="#e07a5f"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="contact-footer">© {new Date().getFullYear()} Bryan Zhu</div>
    </section>
  );
}
