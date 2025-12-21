# StatCard

A card component for displaying statistics with trends and actions.

## Usage

```tsx
import { StatCard } from './StatCard';
import { Users } from 'lucide-react';

<StatCard
  title="Total Users"
  value="1,234"
  change={12}
  trend="up"
  icon={Users}
/>
```