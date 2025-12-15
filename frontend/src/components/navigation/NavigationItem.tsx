import React from 'react';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui';
import type { NavItem } from '../../hooks';

interface NavigationItemProps {
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

export const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  index,
  isDraggedOver,
  isDragged,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onToggle,
}) => {
  const Icon = item.icon;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, index)}
      className={`
        flex items-center gap-4 p-4 border rounded-lg cursor-move transition-all
        ${isDraggedOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
        ${isDragged ? 'opacity-50' : ''}
        hover:bg-gray-50 dark:hover:bg-gray-800
      `}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0">
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </div>

      {/* Item Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">
            {item.name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {item.path}
          </span>
        </div>
      </div>

      {/* Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onToggle(item.id)}
        className="flex items-center gap-2"
      >
        {item.enabled ? (
          <Eye className="h-4 w-4 text-green-600" />
        ) : (
          <EyeOff className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-sm">{item.enabled ? 'Visible' : 'Hidden'}</span>
      </Button>
    </div>
  );
};