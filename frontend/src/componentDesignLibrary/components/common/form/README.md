# Form

A form wrapper that handles submission and loading states.

## Usage

```tsx
import { Form } from './Form';

<Form onSubmit={(data) => console.log(data)}>
  <input name="username" />
  <button type="submit">Submit</button>
</Form>
```