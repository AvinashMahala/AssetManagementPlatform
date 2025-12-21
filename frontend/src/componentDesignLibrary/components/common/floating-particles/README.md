# FloatingParticles

A background effect component that renders floating particles on a canvas.

## Usage

```tsx
import { FloatingParticles } from './FloatingParticles';

<div className="relative h-64 w-full">
  <FloatingParticles count={50} />
  <div className="relative z-10">Content over particles</div>
</div>
```