export interface PropertyActionsProps {
  propertyId: string;
  propertyName: string;
  onDelete: (id: string, name: string) => void;
  variant?: 'card' | 'table';
  className?: string;
}
