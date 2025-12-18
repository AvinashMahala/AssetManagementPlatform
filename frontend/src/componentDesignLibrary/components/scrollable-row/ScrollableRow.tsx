import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { ScrollableRowProps } from './types';
import './ScrollableRow.scss';

export function ScrollableRow({
  title,
  children,
  onScrollLeft,
  onScrollRight,
  className = ''
}: ScrollableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Default scroll handlers if not provided
  const handleScrollLeft = () => {
    if (onScrollLeft) onScrollLeft();
    else if (containerRef.current) containerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    if (onScrollRight) onScrollRight();
    else if (containerRef.current) containerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleScrollLeft();
      else if (e.key === 'ArrowRight') handleScrollRight();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [onScrollLeft, onScrollRight]);

  return (
    <div className={`scrollable-row-container relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleScrollLeft}
            className="h-8 w-8 p-0"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleScrollRight}
            className="h-8 w-8 p-0"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="scrollable-content overflow-x-auto flex space-x-4 pb-2 scrollbar-hide"
        tabIndex={0}
        role="region"
        aria-label={title || "Scrollable content"}
      >
        {children}
      </div>
    </div>
  );
}