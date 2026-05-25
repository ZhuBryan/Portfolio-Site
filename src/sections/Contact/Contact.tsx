import ParallaxCoralBackdrop from '../../components/ParallaxCoralBackdrop';
import Turtle from '../../svg/Turtle';
import './Contact.css';

export default function Contact() {
  return (
    <section className="contact-section" id="contact">
      <ParallaxCoralBackdrop tone="blue" density="quiet" />
      <div className="contact-turtle-wrap">
        <Turtle size={48} />
      </div>
      <div className="contact-tagline">always open to cool problems</div>
      <div className="contact-sub">the turtle will find you first, but just in case —</div>
      <div className="contact-links">
        <a className="contact-link" href="mailto:bryan.zhu@uwaterloo.ca">
          ✉ Email
        </a>
        <a
          className="contact-link"
          href="https://linkedin.com/in/bryan-zhu101"
          target="_blank"
          rel="noopener noreferrer"
        >
          in LinkedIn
        </a>
        <a
          className="contact-link"
          href="https://github.com/ZhuBryan"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⌥ GitHub
        </a>
      </div>
      <div className="contact-footer">© {new Date().getFullYear()} Bryan Zhu</div>
    </section>
  );
}
