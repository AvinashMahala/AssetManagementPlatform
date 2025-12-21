import { useCallback } from 'react';

export const useChartCarousel = () => {
  const scrollLeft = useCallback(() => {
    const container = document.querySelector('.charts-carousel');
    if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    const container = document.querySelector('.charts-carousel');
    if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
  }, []);

  return { scrollLeft, scrollRight };
};