# PropertyActions

A component that renders the standard action buttons for a property (Rent, Dashboard, Edit, Delete).

## Usage

```tsx
import { PropertyActions } from './PropertyActions';

<PropertyActions
  propertyId="123"
  propertyName="Sunset Villa"
  onDelete={handleDelete}
  variant="card" // or "table"
/>
```
