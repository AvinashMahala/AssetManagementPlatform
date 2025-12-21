# ValidationFeedback

Components for displaying validation feedback, email verification status, and retry actions.

## Usage

```tsx
import { ValidationFeedback } from './ValidationFeedback';

<ValidationFeedback
  type="error"
  message="Something went wrong"
  onDismiss={() => console.log('dismissed')}
/>
```