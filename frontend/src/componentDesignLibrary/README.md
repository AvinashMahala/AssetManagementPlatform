# Component Design Library

A centralized, modular design system for the Asset Management Platform. This library provides reusable UI components, layouts, and patterns to ensure consistency and maintainability across the application.

## Table of Contents

- [Overview](#overview)
- [Installation & Usage](#installation--usage)
- [Component Index](#component-index)
  - [Data Display](#data-display)
  - [Feedback & Status](#feedback--status)
  - [Forms & Layout](#forms--layout)
  - [Navigation & Structure](#navigation--structure)
- [Contributing](#contributing)

## Overview

The Component Design Library (CDL) is structured to be modular and independent. Each component resides in its own directory with its logic, styles, types, and documentation.

## Installation & Usage

Components are exported from the root of the library. You can import them directly:

```tsx
import { StatsCard, DataTable, AlertCard } from '../componentDesignLibrary';
```

## Component Index

### Common UI

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[Button](./components/common/button)** | Standard button component. | [Read More](./components/common/button/README.md) |
| **[Card](./components/common/card)** | Container for content. | [Read More](./components/common/card/README.md) |
| **[Input](./components/common/input)** | Form input field. | [Read More](./components/common/input/README.md) |
| **[Badge](./components/common/badge)** | Status indicator. | [Read More](./components/common/badge/README.md) |
| **[Alert](./components/common/alert)** | Callout for user attention. | [Read More](./components/common/alert/README.md) |

### Data Display

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[StatsCard](./components/stats-card)** | Displays a statistic with value, trend, and action. | [Read More](./components/stats-card/README.md) |
| **[ListCard](./components/list-card)** | A card displaying a list of items with badges. | [Read More](./components/list-card/README.md) |
| **[DataTable](./components/data-table)** | Advanced table with sorting, filtering, and pagination. | [Read More](./components/data-table/README.md) |
| **[PhotoCarousel](./components/PhotoCarousel.tsx)** | Image carousel for property galleries. | - |
| **[ScrollableRow](./components/scrollable-row)** | Horizontal scrolling container for cards/charts. | [Read More](./components/scrollable-row/README.md) |

### Feedback & Status

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[AlertCard](./components/alert-card)** | Displays warnings, errors, or info messages. | [Read More](./components/alert-card/README.md) |
| **[StatusBadge](./components/status-badge)** | Standardized badge for status indication. | - |
| **[LoadingSpinner](./components/loading-spinner)** | Loading indicators for various contexts. | - |
| **[EmptyState](./components/empty-state)** | Placeholder UI for empty data states. | - |
| **[ConfirmDialog](./components/confirm-dialog)** | Modal for confirming user actions. | - |

### Forms & Layout

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[FormActions](./components/FormActions.tsx)** | Standard Save/Cancel button group. | - |
| **[FormGrid](./components/FormGrid.tsx)** | Grid layout system for forms. | - |
| **[BaseForm](./forms/BaseForm.tsx)** | Complete form wrapper with layout and validation. | - |
| **[FormLayout](./layouts/FormLayout.tsx)** | Page layout for form screens. | - |

### Navigation & Structure

| Component | Description | Documentation |
|-----------|-------------|---------------|
| **[PageHeader](./components/PageHeader.tsx)** | Standard page header with title and actions. | - |

## Contributing

When adding a new component:
1. Create a new folder in `components/`.
2. Include `index.ts`, `Component.tsx`, `types.ts`, `Component.scss`, and `README.md`.
3. Export the component in `src/componentDesignLibrary/index.ts`.
4. Update this README.
