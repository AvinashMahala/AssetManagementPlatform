# ListCard

A generic card component for displaying a list of items with titles, subtitles, and status badges.

## Usage

```tsx
import { ListCard } from './ListCard';

<ListCard
  title="Recent Activity"
  items={[
    { id: '1', title: 'Item 1', subtitle: 'Details', badge: { label: 'New', variant: 'default' } }
  ]}
/>
```