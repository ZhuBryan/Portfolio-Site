import { useEffect, useState } from 'react';
import './Navbar.css';

const LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

/**
 * Floating glass navbar. Transparent while the sunlit hero is on screen,
 * then frosts over once the user starts diving so links stay readable
 * against the changing water colors.
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <a className="nav__brand" href="#hero" aria-label="Back to top">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            d="M3 14c3-6 9-9 18-8-1 9-4 15-10 15-3 0-5-2-5-4 0-3 3-5 7-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Bryan Zhu</span>
      </a>
      <nav className="nav__links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.href} className="nav__link" href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="nav__cta" href="/Bryan_Zhu_Resume.pdf" download>
        Resume
      </a>
    </header>
  );
}
