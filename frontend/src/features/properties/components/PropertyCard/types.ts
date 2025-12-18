import type { Property } from '../../../../types/property';

export interface PropertyCardProps {
  property: Property;
  isSelected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onDelete: (id: string, name: string) => void;
  index?: number;
  className?: string;
}
