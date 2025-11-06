# CDC (Common Design Components)

A centralized design system and component framework for the Asset Management Platform.

## Overview

CDC provides reusable, consistent components and patterns that can be used across all screens in the application. This ensures maintainability and consistency when changes are needed.

## Structure

```
src/cdc/
├── components/     # Reusable UI components
├── layouts/        # Layout components
├── forms/          # Form-specific components
├── patterns/       # Common UI patterns
├── hooks/          # Custom hooks
├── utils/          # Utility functions
├── types/          # TypeScript types
└── index.ts        # Main exports
```

## Key Components

### FormLayout
Base layout for forms with fixed header/footer and scrollable content.

```tsx
import { FormLayout } from '../cdc';

<FormLayout
  title="Page Title"
  subtitle="Create Item"
  backTo="/items"
  backLabel="Back to Items"
  onBack={() => navigate('/items')}
  onCancel={() => navigate('/items')}
  onSubmit={() => handleSubmit()}
  loading={loading}
>
  {/* Form content */}
</FormLayout>
```

### BaseForm
Complete form wrapper with layout, grid, and actions.

```tsx
import { BaseForm, FormColumn } from '../cdc';

<BaseForm
  title="Items"
  subtitle="Create Item"
  backTo="/items"
  backLabel="Back to Items"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  loading={loading}
>
  <FormColumn title="Basic Info" icon={<Icon />}>
    {/* Form fields */}
  </FormColumn>

  <FormColumn title="Details" icon={<Icon />}>
    {/* Form fields */}
  </FormColumn>
</BaseForm>
```

### FormColumn
Individual column component for 3-column layouts.

```tsx
<FormColumn
  title="Section Title"
  description="Section description"
  icon={<Icon className="h-5 w-5" />}
>
  {/* Form fields */}
</FormColumn>
```

## Usage Examples

### Creating a New Form Component

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseForm, FormColumn, Input, FormField } from '../../cdc';

const MyFormComponent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic
  };

  const handleCancel = () => {
    navigate('/items');
  };

  return (
    <BaseForm
      title="Items"
      subtitle="Create Item"
      backTo="/items"
      backLabel="Back to Items"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    >
      <FormColumn title="Basic Information">
        <FormField label="Name" required>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </FormField>
      </FormColumn>

      <FormColumn title="Details">
        <FormField label="Description">
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </FormField>
      </FormColumn>
    </BaseForm>
  );
};
```

## Benefits

1. **Consistency**: All forms follow the same patterns and styling
2. **Maintainability**: Changes to common components affect all screens
3. **Reusability**: Components can be easily reused across different features
4. **Scalability**: Easy to add new screens using existing patterns
5. **Developer Experience**: Simplified component creation with pre-built layouts

## Adding New Components

When adding new components to CDC:

1. Place in appropriate subfolder (`components/`, `layouts/`, etc.)
2. Export from `index.ts`
3. Add documentation to this README
4. Ensure TypeScript types are properly defined
5. Follow existing naming conventions

## Migration Guide

To migrate existing forms to use CDC:

1. Replace manual layout code with `BaseForm`
2. Replace `Card` components with `FormColumn`
3. Import components from `../cdc` instead of individual paths
4. Remove redundant layout and styling code
5. Test responsiveness and functionality