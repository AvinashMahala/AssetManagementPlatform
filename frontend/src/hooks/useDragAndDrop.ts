import { useState, useCallback } from 'react';
import type { NavItem } from '../hooks/useNavigationConfig';

interface DragState {
  draggedItem: NavItem | null;
  dragOverIndex: number | null;
}

export const useDragAndDrop = (
  items: NavItem[],
  onReorder: (newItems: NavItem[]) => void
) => {
  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dragOverIndex: null,
  });

  const handleDragStart = useCallback((e: React.DragEvent, item: NavItem) => {
    setDragState({ draggedItem: item, dragOverIndex: null });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragState((prev) => ({ ...prev, dragOverIndex: index }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({ draggedItem: null, dragOverIndex: null });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();

      const { draggedItem } = dragState;
      if (!draggedItem) return;

      const currentIndex = items.findIndex((item) => item.id === draggedItem.id);
      if (currentIndex === -1 || currentIndex === dropIndex) return;

      const newItems = [...items];
      const [removed] = newItems.splice(currentIndex, 1);
      newItems.splice(dropIndex, 0, removed);

      onReorder(newItems);
      setDragState({ draggedItem: null, dragOverIndex: null });
    },
    [dragState, items, onReorder]
  );

  return {
    draggedItem: dragState.draggedItem,
    dragOverIndex: dragState.dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  };
};