// Layouts
export { FormLayout } from './layouts/FormLayout';

// Forms
export { BaseForm } from './forms/BaseForm';
export { GenericTabbedForm } from './forms/generic-tabbed-form';
export type { GenericTabbedFormProps, TabConfig } from './forms/generic-tabbed-form';

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

// Core UI Components
export { Button, buttonVariants } from './components/common/button';
export type { ButtonProps } from './components/common/button';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/common/card';

export { Input } from './components/common/input';
export type { InputProps } from './components/common/input';

export { Badge, badgeVariants } from './components/common/badge';
export type { BadgeProps } from './components/common/badge';

export { Alert, AlertTitle, AlertDescription } from './components/common/alert';

// Re-export common UI components for convenience
export { FormField } from './components/common/form-field';
export type { FormFieldProps } from './components/common/form-field';
export { AuthLoading } from './components/common/auth-loading';
export type { AuthLoadingProps } from './components/common/auth-loading';

export { Breadcrumbs } from './components/common/breadcrumbs';
export type { BreadcrumbsProps, BreadcrumbItem } from './components/common/breadcrumbs';

export { ChartContainer } from './components/common/chart-container';
export type { ChartContainerProps } from './components/common/chart-container';

export {
  RevenueTrendChart,
  OccupancyRateChart,
  PaymentCollectionChart,
  PropertyStatusChart,
  ComparisonChart
} from './components/common/charts';
export type {
  ChartData,
  BaseChartProps,
  PaymentCollectionData,
  PaymentCollectionChartProps,
  PieChartProps,
  ComparisonChartProps
} from './components/common/charts';

export { Checkbox } from './components/common/checkbox';
export type { CheckboxProps } from './components/common/checkbox';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/common/dialog';
export type {
  DialogProps,
  DialogTriggerProps,
  DialogPortalProps,
  DialogCloseProps,
  DialogOverlayProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
} from './components/common/dialog';

export { ExpandableSection } from './components/common/expandable-section';
export type { ExpandableSectionProps } from './components/common/expandable-section';

export { FloatingParticles } from './components/common/floating-particles';
export type { FloatingParticlesProps } from './components/common/floating-particles';

export { Form } from './components/common/form';
export type { FormProps } from './components/common/form';


// I will handle the replacement in the next step, but for now I will add the new export and then clean up.
// Actually, I should check if FormField is already exported.


export { Label } from './components/common/label';
export type { LabelProps } from './components/common/label';

export { Loading } from './components/common/loading';
export type { LoadingProps } from './components/common/loading';

export {
  Pagination,
} from './components/common/pagination';
export type { PaginationProps } from './components/common/pagination';

export { PasswordInput } from './components/common/password-input';
export type { PasswordInputProps } from './components/common/password-input';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './components/common/select';
export type {
  SelectProps,
  SelectGroupProps,
  SelectValueProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectLabelProps,
  SelectItemProps,
  SelectSeparatorProps,
  SelectScrollUpButtonProps,
  SelectScrollDownButtonProps,
} from './components/common/select';

export { Skeleton } from './components/common/skeleton';
export type { SkeletonProps } from './components/common/skeleton';

export { StatCard } from './components/common/stat-card';
export type { StatCardProps } from './components/common/stat-card';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './components/common/table';
export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableHeadProps,
  TableRowProps,
  TableCellProps,
  TableCaptionProps,
} from './components/common/table';

export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/common/tabs';
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from './components/common/tabs';

export { Textarea } from './components/common/textarea';
export type { TextareaProps } from './components/common/textarea';

export { Toast } from './components/common/toast';

export { Tooltip } from './components/common/tooltip';
export type { TooltipProps } from './components/common/tooltip';

export {
  ValidationFeedback,
  EmailVerificationStatus,
  RetryButton,
  useRealTimeValidation,
} from './components/common/validation-feedback';
export type {
  ValidationFeedbackProps,
  EmailVerificationStatusProps,
  RetryButtonProps,
} from './components/common/validation-feedback';

