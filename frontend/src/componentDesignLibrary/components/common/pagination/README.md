# Pagination

A pagination component to navigate through pages of data.

## Usage

```tsx
import { Pagination } from './Pagination';

<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => console.log(page)}
/>
```