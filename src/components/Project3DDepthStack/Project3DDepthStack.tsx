import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { DeckCard } from '../../data/projects';
import './Project3DDepthStack.css';

interface Project3DDepthStackProps {
  cards: DeckCard[];
  accentColor: string;
  /** Stable id so the deck resets when the modal opens a new project. */
  projectId: string;
}

/**
 * 3D depth stack — front card sits forward, the rest fan back along the
 * z-axis with progressive scale + vertical drop + opacity falloff.
 * Clicking the front card cycles it to the back of the deck.
 *
 * Performance notes:
 *  - We animate `y` only on hover (no rotateX/Y). Tilt animations on top of
 *    the existing z/scale spring caused the hover stutter seen previously.
 *  - Back cards get `pointer-events: none` so they cannot intercept the
 *    cursor and trigger thrashing.
 *  - Each card uses transform-style + backface-visibility hints to keep the
 *    composite layer on the GPU.
 */
export default function Project3DDepthStack({
  cards,
  accentColor,
  projectId,
}: Project3DDepthStackProps) {
  const [order, setOrder] = useState<DeckCard[]>(cards);

  useEffect(() => {
    setOrder(cards);
  }, [cards, projectId]);

  const cycleFront = () => {
    setOrder((prev) => {
      if (prev.length < 2) return prev;
      const [front, ...rest] = prev;
      return [...rest, front];
    });
  };

  return (
    <div className="deck-pane">
      <div className="deck-pane__viewport">
        {order.map((card, index) => {
          const isFront = index === 0;
          const depthZ = -index * 56;
          const yDrop = index * 14;
          const scale = 1 - index * 0.06;
          // Stable doc number derived from original position in the cards array
          const originalIndex = cards.findIndex((c) => c.title === card.title);
          const docNo = String(originalIndex + 1).padStart(2, '0');

          return (
            <motion.button
              key={`${projectId}-${card.title}`}
              type="button"
              className={`deck-card ${isFront ? 'deck-card--front' : 'deck-card--back'}`}
              onClick={isFront ? cycleFront : undefined}
              animate={{
                z: depthZ,
                y: yDrop,
                scale,
                opacity: index === 0 ? 1 : index === 1 ? 0.65 : 0.32,
              }}
              whileHover={isFront ? { y: yDrop - 8 } : undefined}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              style={{
                zIndex: order.length - index,
                pointerEvents: isFront ? 'auto' : 'none',
              }}
              aria-label={isFront ? `Cycle deck — currently showing ${card.title}` : undefined}
              tabIndex={isFront ? 0 : -1}
            >
              <span
                className="deck-card__accent"
                style={{ background: isFront ? accentColor : 'rgba(78,203,160,0.15)' }}
              />

              <div className="deck-card__head">
                <span className="deck-card__doc">
                  <span className="deck-card__doc-no">DOC_{docNo}</span>
                  <span className="deck-card__doc-sep" />
                  <span className="deck-card__doc-system">
                    {projectId.replace(/-/g, '_').toUpperCase()}
                  </span>
                </span>
                {isFront && <span className="deck-card__hint">click → cycle</span>}
              </div>

              <div className="deck-card__body">
                <span
                  className="deck-card__type"
                  style={isFront ? { color: accentColor, borderColor: accentColor } : undefined}
                >
                  {card.type}
                </span>
                <h4 className="deck-card__title">{card.title}</h4>
                <p className="deck-card__copy">{card.content}</p>
              </div>

              <div className="deck-card__footer">
                <span className="deck-card__index">
                  {String(index + 1).padStart(2, '0')} / {String(order.length).padStart(2, '0')}
                </span>
                <span className="deck-card__status">
                  {isFront ? '● ACTIVE' : '○ STACK'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
