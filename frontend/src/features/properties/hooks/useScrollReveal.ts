import { useState, useEffect, useRef, RefObject } from 'react';

export const useScrollReveal = (sectionIds: string[]) => {
  const [revealedSections, setRevealedSections] = useState<Set<string>>(new Set());
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const setRef = (id: string) => (el: HTMLElement | null) => {
    refs.current[id] = el;
  };

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId) {
            setRevealedSections(prev => new Set([...prev, sectionId]));
          }
        }
      });
    }, observerOptions);

    // Observe sections
    Object.entries(refs.current).forEach(([id, el]) => {
      if (el) {
        // Ensure data-section attribute is set if not already
        if (!el.getAttribute('data-section')) {
          el.setAttribute('data-section', id);
        }
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  const isRevealed = (id: string) => revealedSections.has(id);

  return { setRef, isRevealed, revealedSections };
};
