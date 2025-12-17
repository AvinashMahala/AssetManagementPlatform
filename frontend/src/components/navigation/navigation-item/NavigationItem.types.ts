import type { NavItem } from '../../../hooks';

export interface NavigationItemProps {
  item: NavItem;
  index: number;
  isDraggedOver: boolean;
  isDragged: boolean;
  onDragStart: (e: React.DragEvent, item: NavItem) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  onToggle: (itemId: string) => void;
}