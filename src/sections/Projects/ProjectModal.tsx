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
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
          >
            <div className="modal-accent" style={{ background: project.accentColor }} />
            <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="modal-media">
              {project.mediaType === 'video' && project.youtubeId ? (
                <iframe
                  className="modal-media__video"
                  src={`https://www.youtube.com/embed/${project.youtubeId}`}
                  title={`${project.name} demo video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : project.mediaType === 'video' && project.fullVideoUrl ? (
                <video className="modal-media__video" src={project.fullVideoUrl} controls playsInline />
              ) : (
                <div className="modal-media__gallery">
                  {(project.gallery ?? (project.imageUrl ? [project.imageUrl] : [])).map((src, index) => (
                    <img key={`${src}-${index}`} src={src} alt={`${project.name} gallery ${index + 1}`} />
                  ))}
                </div>
              )}
            </div>

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
                  <h3 className="modal-title">{project.name}</h3>
                  <p className="modal-tagline">{project.description}</p>
                  <p className="modal-body">{project.longDescription ?? project.description}</p>
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
                <h3 className="modal-title">{project.name}</h3>
                <p className="modal-tagline">{project.description}</p>
                <p className="modal-body">{project.longDescription ?? project.description}</p>
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
