# AlertCard

Displays a list of important messages or warnings with optional action buttons.

## Usage

```tsx
import { AlertCard } from './AlertCard';
import { Button } from '@/componentDesignLibrary';

<AlertCard
  title="Attention"
  variant="warning"
  messages={["Lease expiring soon"]}
  actions={<Button>View</Button>}
/>
```