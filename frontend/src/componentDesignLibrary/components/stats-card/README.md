# StatsCard

Displays a statistic with a value, trend, description, and optional action button.

## Usage

```tsx
import { StatsCard } from './StatsCard';

<StatsCard
  title="Total Revenue"
  value="$50,000"
  trend={{ value: 12, direction: 'up' }}
  action={{ label: 'View Details', onClick: () => {} }}
/>
```