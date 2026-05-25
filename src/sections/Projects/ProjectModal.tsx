import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Project, TagTone } from '../../data/projects';
import Project3DDepthStack from '../../components/Project3DDepthStack/Project3DDepthStack';
import './ProjectModal.css';

const TAG_TONE_CLASS: Record<TagTone, string> = {
  teal: 'tag tag-teal',
  amber: 'tag tag-amber',
  blue: 'tag tag-blue',
  purple: 'tag tag-purple',
};

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`modal-card ${project.deckCards?.length ? 'modal-card--with-stack' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} project details`}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="modal-accent"
              style={{ background: project.accentColor, opacity: 0.75 }}
            />
            <button
              className="modal-close"
              type="button"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>

            {project.deckCards?.length ? (
              <div className="modal-grid">
                <div className="modal-grid__stack">
                  <Project3DDepthStack
                    cards={project.deckCards}
                    accentColor={project.accentColor}
                    projectId={project.id}
                  />
                </div>
                <div className="modal-grid__body">
                  <div className="modal-coral modal-coral--inline">
                    <project.Coral />
                  </div>
                  <h3 className="modal-title">{project.name}</h3>
                  <p className="modal-tagline">{project.description}</p>
                  <p className="modal-body">
                    {project.longDescription ?? project.description}
                  </p>
                  <div className="modal-tags">
                    {project.tags.map((t) => (
                      <span key={t.label} className={TAG_TONE_CLASS[t.tone]}>
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-coral">
                  <project.Coral />
                </div>
                <h3 className="modal-title">{project.name}</h3>
                <p className="modal-tagline">{project.description}</p>
                <p className="modal-body">
                  {project.longDescription ?? project.description}
                </p>
                <div className="modal-tags">
                  {project.tags.map((t) => (
                    <span key={t.label} className={TAG_TONE_CLASS[t.tone]}>
                      {t.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
