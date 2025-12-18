import React from 'react';
import { ChartContainer } from '../../../components/ui';
import { RevenueTrendChart, OccupancyRateChart, PaymentCollectionChart, PropertyStatusChart } from '../../../components/ui';
import { ScrollableRow } from '../../../componentDesignLibrary/components/scrollable-row';
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
  return (
    <ScrollableRow
      title="Analytics Overview"
      onScrollLeft={scrollLeft}
      onScrollRight={scrollRight}
      className="charts-carousel-container"
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
    </ScrollableRow>
  );
};

export default React.memo(ChartsCarousel);