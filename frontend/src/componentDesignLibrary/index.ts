// Layouts
export { FormLayout } from './layouts/FormLayout';

// Forms
export { BaseForm } from './forms/BaseForm';

// Components
export { PageHeader } from './components/PageHeader';
export { FormActions } from './components/FormActions';
export { FormColumn, FormGrid } from './components/FormGrid';

// New Components
export { DataTable } from './components/data-table';
export type { Column, Action, DataTableProps } from './components/data-table';

export { StatsCard } from './components/stats-card';
export type { StatsCardProps, TrendDirection } from './components/stats-card';

export { EmptyState } from './components/empty-state';
export type { EmptyStateProps } from './components/empty-state';

export { ConfirmDialog } from './components/confirm-dialog';
export type { ConfirmDialogProps, ConfirmDialogVariant } from './components/confirm-dialog';

export {
  LoadingSpinner,
  PageLoadingSpinner,
  InlineLoadingSpinner,
  ButtonLoadingSpinner
} from './components/loading-spinner';
export type { LoadingSpinnerProps } from './components/loading-spinner';

export { StatusBadge } from './components/status-badge';
export type { StatusBadgeProps, StatusType } from './components/status-badge';

export { PhotoCarousel } from './components/PhotoCarousel';
export type { PhotoCarouselProps } from './components/PhotoCarousel';

export { ListCard } from './components/list-card';
export type { ListCardProps, ListItem } from './components/list-card';

export { AlertCard } from './components/alert-card';
export type { AlertCardProps } from './components/alert-card';

export { ScrollableRow } from './components/scrollable-row';
export type { ScrollableRowProps } from './components/scrollable-row';

// Re-export common UI components for convenience
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
export { Button } from '../components/ui/button';
export { Input } from '../components/ui/input';
export { Textarea } from '../components/ui/textarea';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
export { FormField } from '../components/ui/form-field';
export { Badge } from '../components/ui/badge';