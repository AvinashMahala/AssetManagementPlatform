# ChartContainer

A container component for charts, providing a consistent title and description layout.

## Usage

```tsx
import { ChartContainer } from './ChartContainer';

<ChartContainer 
  title="Revenue Trend" 
  description="Monthly revenue over the last year"
>
  <RevenueTrendChart data={data} />
</ChartContainer>
```