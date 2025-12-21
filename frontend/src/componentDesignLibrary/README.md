# Component Design Library

A centralized, modular design system for the Asset Management Platform. This library provides reusable UI components, layouts, and patterns to ensure consistency and maintainability across the application.

## Table of Contents

- [Overview](#overview)
- [Installation & Usage](#installation--usage)
- [Component Index](#component-index)
  - [Common UI Components](#common-ui-components)
  - [Form Components](#form-components)
  - [Data Display](#data-display)
  - [Charts & Visualization](#charts--visualization)
  - [Feedback & Status](#feedback--status)
  - [Navigation & Structure](#navigation--structure)
  - [Forms & Layout](#forms--layout)
  - [Special Components](#special-components)
- [Contributing](#contributing)

## Overview

The Component Design Library (CDL) is structured to be modular and independent. Each component resides in its own directory with its logic, styles, types, and documentation.

## Installation & Usage

Components are exported from the root of the library. You can import them directly:

```tsx
import { Button, Input, StatsCard, DataTable, AlertCard } from '../componentDesignLibrary';
```

## Component Index

### Common UI Components

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[Button](./components/common/button)** | Standard button component with variants and states. | [Read More](./components/common/button/README.md) |
| **[Card](./components/common/card)** | Container component for content grouping. | [Read More](./components/common/card/README.md) |
| **[Badge](./components/common/badge)** | Status and label indicator component. | [Read More](./components/common/badge/README.md) |
| **[Alert](./components/common/alert)** | Callout component for user attention. | [Read More](./components/common/alert/README.md) |
| **[Dialog](./components/common/dialog)** | Modal dialog component for overlays. | [Read More](./components/common/dialog/README.md) |
| **[Toast](./components/common/toast)** | Notification component for user feedback. | [Read More](./components/common/toast/README.md) |
| **[Tooltip](./components/common/tooltip)** | Contextual help tooltip component. | [Read More](./components/common/tooltip/README.md) |
| **[Tabs](./components/common/tabs)** | Tab navigation component. | [Read More](./components/common/tabs/README.md) |
| **[Breadcrumbs](./components/common/breadcrumbs)** | Navigation breadcrumb component. | [Read More](./components/common/breadcrumbs/README.md) |
| **[Pagination](./components/common/pagination)** | Page navigation component. | [Read More](./components/common/pagination/README.md) |
| **[ExpandableSection](./components/common/expandable-section)** | Collapsible content section. | [Read More](./components/common/expandable-section/README.md) |

### Form Components

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[Input](./components/common/input)** | Standard text input field. | [Read More](./components/common/input/README.md) |
| **[PasswordInput](./components/common/password-input)** | Password input with visibility toggle. | [Read More](./components/common/password-input/README.md) |
| **[Textarea](./components/common/textarea)** | Multi-line text input field. | [Read More](./components/common/textarea/README.md) |
| **[Select](./components/common/select)** | Dropdown selection component. | [Read More](./components/common/select/README.md) |
| **[Checkbox](./components/common/checkbox)** | Checkbox input component. | [Read More](./components/common/checkbox/README.md) |
| **[Label](./components/common/label)** | Form label component. | [Read More](./components/common/label/README.md) |
| **[FormField](./components/common/form-field)** | Complete form field wrapper with label and validation. | [Read More](./components/common/form-field/README.md) |
| **[ValidationFeedback](./components/common/validation-feedback)** | Form validation feedback messages. | [Read More](./components/common/validation-feedback/README.md) |

### Data Display

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[Table](./components/common/table)** | Basic table component. | [Read More](./components/common/table/README.md) |
| **[DataTable](./components/data-table)** | Advanced table with sorting, filtering, and pagination. | [Read More](./components/data-table/README.md) |
| **[StatsCard](./components/stats-card)** | Displays a statistic with value, trend, and action. | [Read More](./components/stats-card/README.md) |
| **[StatCard](./components/common/stat-card)** | Simple statistic display card. | [Read More](./components/common/stat-card/README.md) |
| **[ListCard](./components/list-card)** | A card displaying a list of items with badges. | [Read More](./components/list-card/README.md) |
| **[ScrollableRow](./components/scrollable-row)** | Horizontal scrolling container for cards/charts. | [Read More](./components/scrollable-row/README.md) |

### Charts & Visualization

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[Charts](./components/common/charts)** | Comprehensive chart components (Line, Bar, Pie, etc.). | [Read More](./components/common/charts/README.md) |
| **[ChartContainer](./components/common/chart-container)** | Wrapper for chart components with consistent styling. | [Read More](./components/common/chart-container/README.md) |

### Feedback & Status

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[AlertCard](./components/alert-card)** | Displays warnings, errors, or info messages. | [Read More](./components/alert-card/README.md) |
| **[StatusBadge](./components/status-badge)** | Standardized badge for status indication. | - |
| **[Loading](./components/common/loading)** | Loading indicators and spinners. | [Read More](./components/common/loading/README.md) |
| **[LoadingSpinner](./components/loading-spinner)** | Loading spinner component. | - |
| **[Skeleton](./components/common/skeleton)** | Skeleton loading placeholder. | [Read More](./components/common/skeleton/README.md) |
| **[EmptyState](./components/empty-state)** | Placeholder UI for empty data states. | - |
| **[ConfirmDialog](./components/confirm-dialog)** | Modal for confirming user actions. | - |
| **[AuthLoading](./components/common/auth-loading)** | Authentication loading screen. | [Read More](./components/common/auth-loading/README.md) |

### Navigation & Structure

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[PageHeader](./components/PageHeader.tsx)** | Standard page header with title and actions. | - |

### Forms & Layout

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[FormActions](./components/FormActions.tsx)** | Standard Save/Cancel button group. | - |
| **[FormGrid](./components/FormGrid.tsx)** | Grid layout system for forms. | - |
| **[BaseForm](./forms/BaseForm.tsx)** | Complete form wrapper with layout and validation. | - |
| **[FormLayout](./layouts/FormLayout.tsx)** | Page layout for form screens. | - |

### Special Components

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[PhotoCarousel](./components/PhotoCarousel.tsx)** | Image carousel for property galleries. | - |
| **[FloatingParticles](./components/common/floating-particles)** | Animated background particles effect. | [Read More](./components/common/floating-particles/README.md) |

## Contributing

When adding a new component:
1. Create a new folder in `components/` or `components/common/` depending on the component scope.
2. Include `index.ts`, `Component.tsx`, `types.ts`, `Component.scss`, and `README.md`.
3. Export the component in `src/componentDesignLibrary/index.ts`.
4. Update this README with the component entry in the appropriate section.
