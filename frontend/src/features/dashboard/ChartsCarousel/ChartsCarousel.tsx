import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, ChartContainer } from '../../../components/ui';
import { RevenueTrendChart, OccupancyRateChart, PaymentCollectionChart, PropertyStatusChart } from '../../../components/ui';
import './ChartsCarousel.scss';

interface ChartsCarouselProps {
  chartData: {
    revenue: any[];
    occupancy: any[];
    collection: any[];
    propertyStatus: any[];
  };
  scrollLeft: () => void;
  scrollRight: () => void;
}

const ChartsCarousel: React.FC<ChartsCarouselProps> = ({ chartData, scrollLeft, scrollRight }) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollLeft();
      } else if (e.key === 'ArrowRight') {
        scrollRight();
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('keydown', handleKeyDown);
      return () => carousel.removeEventListener('keydown', handleKeyDown);
    }
  }, [scrollLeft, scrollRight]);

  return (
    <div className="relative charts-carousel-container">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={scrollLeft}
            className="carousel-nav-btn"
            aria-label="Scroll charts left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={scrollRight}
            className="carousel-nav-btn"
            aria-label="Scroll charts right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={carouselRef}
        className="charts-carousel overflow-x-auto flex space-x-4 pb-2"
        tabIndex={0}
        role="region"
        aria-label="Charts carousel"
      >
        <ChartContainer title="Revenue Trend" description="Monthly revenue over the last 6 months">
          <RevenueTrendChart data={chartData.revenue} height={250} />
        </ChartContainer>

        <ChartContainer title="Occupancy Rate" description="Unit occupancy trend over time">
          <OccupancyRateChart data={chartData.occupancy} height={250} />
        </ChartContainer>

        <ChartContainer title="Payment Collection" description="Collected vs pending payments (in thousands)">
          <PaymentCollectionChart data={chartData.collection} height={250} />
        </ChartContainer>

        <ChartContainer title="Property Status Distribution" description="Properties by current status">
          <PropertyStatusChart data={chartData.propertyStatus} height={250} />
        </ChartContainer>
      </div>
    </div>
  );
};

export default React.memo(ChartsCarousel);